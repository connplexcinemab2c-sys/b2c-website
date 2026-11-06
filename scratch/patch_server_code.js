const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };

async function runSSM(commandString) {
    const jsonPayload = {
        DocumentName: 'AWS-RunShellScript',
        InstanceIds: ['i-01c1713a8fb9544b9'],
        Parameters: {
            commands: [commandString]
        }
    };

    const tempJsonPath = path.join(__dirname, 'temp_patch.json');
    fs.writeFileSync(tempJsonPath, JSON.stringify(jsonPayload, null, 2));

    try {
        const sendOutput = execSync(`aws ssm send-command --cli-input-json file://${tempJsonPath} --query "Command.CommandId" --output text`, { encoding: 'utf8', env }).trim();
        console.log(`SSM Command sent: ${sendOutput}`);

        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            await sleep(2000);

            try {
                const invocationRaw = execSync(`aws ssm get-command-invocation --command-id "${sendOutput}" --instance-id "i-01c1713a8fb9544b9" --output json`, { encoding: 'utf8', env });
                const invocation = JSON.parse(invocationRaw);
                const status = invocation.Status;
                if (['Success', 'Failed', 'Cancelled', 'TimedOut'].includes(status)) {
                    console.log(`Status: ${status}`);
                    console.log('=== STDOUT ===\n' + invocation.StandardOutputContent);
                    if (invocation.StandardErrorContent) {
                        console.log('=== STDERR ===\n' + invocation.StandardErrorContent);
                    }
                    return invocation;
                }
            } catch (err) {}
        }
    } finally {
        try { fs.unlinkSync(tempJsonPath); } catch (e) {}
    }
}

const remoteJs = `
const fs = require('fs');
const path = require('path');

function patchBooking(baseDir) {
    const p = path.join(baseDir, 'src/controller/booking/Booking.js');
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    const oldBooking = /let movieDetails = await Movie\\.findById\\(\\{ _id: movieId \\}\\);\\s*const uniqueCode = movieDetails\\.uniqueFilmCode;\\s*const moviesByUniqueCode = await Movie\\.find\\(\\{[\\s\\S]*?deletedStatus: 0,?\\s*\\}\\);\\s*const filmCodes = moviesByUniqueCode[\\s\\S]*?\\);/m;

    const newBooking = \`let movieDetails = await Movie.findById({ _id: movieId }).lean();
    const uniqueCode = movieDetails?.uniqueFilmCode;
    let filmCodes = [];
    if (uniqueCode) {
      const moviesByUniqueCode = await Movie.find(
        { uniqueFilmCode: uniqueCode, deletedStatus: 0 },
        { filmCode: 1 }
      ).lean();
      filmCodes = moviesByUniqueCode
        .map((m) => m?.filmCode)
        .filter(Boolean)
        .map((filmCodeSlice) => new RegExp(filmCodeSlice, "i"));
    } else if (movieDetails?.filmCode) {
      filmCodes = [new RegExp(movieDetails.filmCode, "i")];
    }\`;

    if (oldBooking.test(content)) {
        content = content.replace(oldBooking, newBooking);
        fs.writeFileSync(p, content);
        console.log('Patched Booking.js in ' + baseDir);
    } else {
        console.log('Booking.js pattern already applied or not matched in ' + baseDir);
    }
}

function patchMovies(baseDir) {
    const p = path.join(baseDir, 'src/controller/user/Movies.js');
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    const marker = 'export const moviesShowByCinema = async (req, res) => {';
    const parts = content.split(marker);
    if (parts.length !== 2) {
        console.log('Movies.js marker split != 2 in ' + baseDir);
        return;
    }

    let funcBody = parts[1];

    const target1 = /const moviesDetails = await Movie\\.find\\(\\{[\\s\\S]*?const cinemas = await Cinema\\.find\\(\\{[\\s\\S]*?\\n\\s*\\}\\);/m;
    const repl1 = \`const cinemaIds = [];
    if (
      cinemaDetails &&
      (!regionId || cinemaDetails.regionId?.toString() == regionId?.toString()) &&
      cinemaDetails.displayName
    ) {
      cinemaIds.push(cinemaDetails._id);
    }\`;

    let modified = false;
    if (target1.test(funcBody)) {
        funcBody = funcBody.replace(target1, repl1);
        modified = true;
    }

    const target2 = /const cinemaIds = \\[\\];\\s*cinemas\\.map\\([\\s\\S]*?\\}\\);\\s*\\n/m;
    if (target2.test(funcBody)) {
        funcBody = funcBody.replace(target2, '');
        modified = true;
    }

    const target3 = /if \\(moviesDetails\\.uniqueFilmCode\\) \\{[\\s\\S]*?matchstage\\.filmCode = \\{[\\s\\S]*?\\};\\s*\\n\\s*\\}/m;
    if (target3.test(funcBody)) {
        funcBody = funcBody.replace(target3, '');
        modified = true;
    }

    if (modified) {
        content = parts[0] + marker + funcBody;
        fs.writeFileSync(p, content);
        console.log('Patched Movies.js in ' + baseDir);
    } else {
        console.log('Movies.js already patched or pattern not found in ' + baseDir);
    }
}

patchBooking('/home/ubuntu/connplex_backend');
patchMovies('/home/ubuntu/connplex_backend');
patchBooking('/var/www/connplex-staging/Backend');
patchMovies('/var/www/connplex-staging/Backend');
`;

const jsB64 = Buffer.from(remoteJs).toString('base64');

const ssmCommand = `
echo "${jsB64}" | base64 -d | node

echo "=== RESTART PM2 ==="
export PM2_HOME=/root/.pm2
pm2 restart connplex_backend
pm2 restart connplex-backend-staging
pm2 save

sleep 4

echo "=== PM2 STATUS ==="
pm2 list

echo "=== TOP PROCESSES ==="
ps aux --sort=-%cpu | head -n 10

echo "=== TEST LOCAL PROD GET-REGION ==="
curl -i -s -w "\nTime: %{time_total}s\n" http://127.0.0.1:3021/api/user/get-region | head -n 25
`;

runSSM(ssmCommand);
