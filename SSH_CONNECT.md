# Connect to Server (54.179.120.126)

## Username: ubuntu
## IP: 54.179.120.126

## Option 1: SSH with Password (if password auth is enabled)

```powershell
ssh ubuntu@54.179.120.126
# Enter your password when prompted
```

## Option 2: SSH with Key File

If you have an SSH key file (.pem or .ppk):

```powershell
# For .pem file
ssh -i path/to/your-key.pem ubuntu@54.179.120.126

# Example:
ssh -i C:\Users\shent\.ssh\my-key.pem ubuntu@54.179.120.126
```

## Option 3: Generate SSH Key (if you don't have one)

### On Windows (PowerShell):

```powershell
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Follow prompts (press Enter to accept defaults)
# Save to: C:\Users\shent\.ssh\id_rsa
```

### Copy Public Key to Server:

```powershell
# Copy your public key to the server
# First, connect with password (if enabled)
ssh ubuntu@54.179.120.126

# On the server, run:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key (from ~/.ssh/id_rsa.pub)
chmod 600 ~/.ssh/authorized_keys
```

## Option 4: Use PuTTY (Windows GUI)

1. Download PuTTY: https://www.putty.org/
2. Open PuTTY
3. Host Name: 54.179.120.126
4. Port: 22
5. Connection Type: SSH
6. Click "Open"
7. Login as: ubuntu
8. Enter password (or use key file in Connection > SSH > Auth > Credentials)

## Troubleshooting

### Permission Denied (publickey)
- You need an SSH key file (.pem) or password authentication
- Contact your server provider for the SSH key or enable password auth

### Connection Timeout
- Check if server is running
- Check firewall allows SSH (port 22)
- Verify IP address is correct

### Host Key Verification Failed
```powershell
# Remove old host key
ssh-keygen -R 54.179.120.126
# Then try again
ssh ubuntu@54.179.120.126
```

## After Connecting

Once connected to the server, you can deploy your application. See `QUICK_DEPLOY.md` or `DEPLOY_TO_SERVER.md` for deployment steps.

