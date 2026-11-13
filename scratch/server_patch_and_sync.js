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

    const tempJsonPath = path.join(__dirname, 'temp_ssm_cmd.json');
    fs.writeFileSync(tempJsonPath, JSON.stringify(jsonPayload, null, 2));

    try {
        const sendOutput = execSync(`aws ssm send-command --cli-input-json file://${tempJsonPath} --query "Command.CommandId" --output text`, { encoding: 'utf8', env }).trim();
        console.log(`SSM Command sent: ${sendOutput}`);

        let attempts = 0;
        while (attempts < 60) {
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

// 1. Script to patch Movies.js and Booking.js on the server
const patchScript = `
const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8').replace(/\\r\\n/g, '\\n');

  // Fix Movies.js
  if (filePath.endsWith('Movies.js')) {
    const oldFind = /let cinemaDetails = await Cinema\\.findById\\([\\s\\S]*?cinemaObjectId: new mongoose\\.Types\\.ObjectId\\(cinemaId\\),/m;
    const newFind = \`if (!cinemaId || cinemaId === "null" || cinemaId === "undefined") {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: {
          movieDetailsWithShows: [],
          cinemaDetails: null,
          uniqueFilteredMovies: [],
          timingCinemawise: [],
        },
      });
    }

    let cinemaQuery;
    if (mongoose.Types.ObjectId.isValid(cinemaId)) {
      cinemaQuery = { _id: new mongoose.Types.ObjectId(cinemaId), isActive: true, deletedStatus: 0 };
    } else {
      cinemaQuery = { cinemaId: String(cinemaId).trim().toUpperCase(), isActive: true, deletedStatus: 0 };
    }

    let cinemaDetails = await Cinema.findOne(
      cinemaQuery,
      {
        displayName: true,
        address: true,
        googleUrl: true,
        cinemaId: true,
        cinema_images: true,
        cinemaAmenities: true,
        lat: true,
        long: true,
        regionId: true,
      }
    ).lean();

    if (!cinemaDetails) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: "Cinema not found",
        data: {
          movieDetailsWithShows: [],
          cinemaDetails: null,
          uniqueFilteredMovies: [],
          timingCinemawise: [],
        },
      });
    }

    const sitesetting = await SiteSetting.findOne();
    cinemaDetails.showExtendedDays = sitesetting?.showExtendedDays || 10;

    const targetCinemaObjectId = cinemaDetails._id;
    const cinemaIds = [targetCinemaObjectId];

    const movieDetailsWithShows = await Show.aggregate([
      {
        $match: {
          cinemaObjectId: targetCinemaObjectId,\`;

    if (oldFind.test(content)) {
      content = content.replace(oldFind, newFind);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✓ Patched ' + filePath);
    } else {
      console.log('- Pattern not found or already patched in ' + filePath);
    }
  }

  // Fix Booking.js
  if (filePath.endsWith('Booking.js')) {
    const oldBooking = /export const moviesDetailsWithshow = async \\(req, res\\) => \\{[\\s\\S]*?const cinemaIds = \\[\\];[\\s\\S]*?cinemas\\.map\\([\\s\\S]*?\\n\\s*\\}\\);/m;
    const newBooking = \`export const moviesDetailsWithshow = async (req, res) => {
  try {
    let { id } = req.body;
    if (!id || typeof id !== "string" || !id.includes("|")) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: [],
      });
    }
    const parts = id.split("|");
    const regionId = (parts[0] || "").trim();
    const date = (parts[1] || "").trim();
    const movieId = (parts[2] || "").trim();

    if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: [],
      });
    }

    const moviesDetails = await Movie.findOne({
      _id: new mongoose.Types.ObjectId(movieId),
      deletedStatus: 0,
    });

    if (!moviesDetails || !moviesDetails.uniqueFilmCode) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIES_DETAILS,
        data: [],
      });
    }

    const uniqueCode = moviesDetails.uniqueFilmCode;

    const moviesByUniqueCode = await Movie.find({
      uniqueFilmCode: uniqueCode,
      deletedStatus: 0,
    });
    const showDate = moment(date || new Date()).format("YYYY-MM-DD");
    const cinemas = await Cinema.find({ deletedStatus: 0, isActive: true });

    const cinemaIds = [];
    cinemas.forEach((cinema) => {
      if (
        (!regionId || (cinema?.regionId && cinema.regionId.toString() === regionId)) &&
        cinema.displayName
      ) {
        cinemaIds.push(cinema._id);
      }
    });\`;

    if (oldBooking.test(content)) {
      content = content.replace(oldBooking, newBooking);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✓ Patched ' + filePath);
    } else {
      console.log('- Pattern not found or already patched in ' + filePath);
    }
  }
}

patchFile('/home/ubuntu/connplex_backend/src/controller/user/Movies.js');
patchFile('/home/ubuntu/connplex_backend/src/controller/booking/Booking.js');
patchFile('/var/www/connplex-staging/Backend/src/controller/user/Movies.js');
patchFile('/var/www/connplex-staging/Backend/src/controller/booking/Booking.js');
`;

const patchScriptB64 = Buffer.from(patchScript).toString('base64');
const batchSyncContent = fs.readFileSync(path.join(__dirname, 'server_sync_all_cinemas_batch.mjs'), 'utf8');
const batchSyncB64 = Buffer.from(batchSyncContent).toString('base64');

async function main() {
    console.log('Step 1: Applying controller patches on server...');
    const step1Cmd = `
node -e "
const fs = require('fs');
fs.writeFileSync('/tmp/patch_controllers.js', Buffer.from('${patchScriptB64}', 'base64').toString('utf8'));
"
node /tmp/patch_controllers.js
`;
    await runSSM(step1Cmd);

    console.log('\nStep 2: Deploying server_sync_all_cinemas_batch.mjs and reloading PM2...');
    const step2Cmd = `
node -e "
const fs = require('fs');
fs.writeFileSync('/home/ubuntu/connplex_backend/server_sync_all_cinemas_batch.mjs', Buffer.from('${batchSyncB64}', 'base64').toString('utf8'));
console.log('Deployed server_sync_all_cinemas_batch.mjs');
"
export PM2_HOME=/root/.pm2
pm2 reload connplex_backend
`;
    await runSSM(step2Cmd);

    console.log('\nStep 3: Executing full multi-location cinema sync...');
    const step3Cmd = `
cd /home/ubuntu/connplex_backend
node server_sync_all_cinemas_batch.mjs
`;
    await runSSM(step3Cmd);
}

main().catch(console.error);
