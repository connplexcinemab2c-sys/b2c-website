import boto3
import json
import time

ssm = boto3.client('ssm', region_name='ap-south-1')

def run_command(cmd):
    response = ssm.send_command(
        InstanceIds=['i-01c1713a8fb9544b9'],
        DocumentName='AWS-RunShellScript',
        Parameters={'commands': [cmd]}
    )
    command_id = response['Command']['CommandId']
    print(f"Sent command {command_id}, waiting...")
    for _ in range(30):
        time.sleep(2)
        result = ssm.get_command_invocation(
            CommandId=command_id,
            InstanceId='i-01c1713a8fb9544b9'
        )
        status = result['Status']
        if status in ['Success', 'Failed', 'Cancelled', 'TimedOut']:
            print(f"Status: {status}")
            print("--- Output ---")
            print(result.get('StandardOutputContent', ''))
            print("--- Error ---")
            print(result.get('StandardErrorContent', ''))
            return result
    print("Timed out waiting for command.")
    return None

if __name__ == '__main__':
    run_command("""
export PM2_HOME=/root/.pm2
echo "=== PM2 LIST ==="
pm2 list
echo "=== TOP PROCESSES ==="
ps aux --sort=-%cpu | head -n 10
echo "=== MEMORY ==="
free -m
echo "=== LOCAL CURL TO BACKEND ==="
curl -i -s -m 5 http://127.0.0.1:3021/api/user/get-region | head -n 25
echo "=== LOCAL CURL VIA NGINX ==="
curl -i -s -m 5 -H "Host: backend.theconnplex.com" http://127.0.0.1/api/user/get-region | head -n 25
echo "=== NGINX ACCESS LOG ==="
tail -n 10 /var/log/nginx/access.log
echo "=== NGINX ERROR LOG ==="
tail -n 10 /var/log/nginx/error.log
""")
