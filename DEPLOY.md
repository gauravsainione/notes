# Deploy NotesKart to DigitalOcean

## Prerequisites
- DigitalOcean Droplet (Ubuntu 24.04 LTS)
- Domain `noteskart.me` pointed to your droplet's IP (A record)

---

## Step 1: Initial Server Setup

```bash
# SSH into your server
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Verify
node -v   # v20.x
npm -v

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot (for SSL)
apt install -y certbot python3-certbot-nginx
```

## Step 2: Upload Your Code

```bash
# Option A: Clone from Git
cd /var/www
git clone YOUR_REPO_URL noteskart
cd noteskart

# Option B: Upload via SCP (from your local machine)
scp -r d:\StudySwap\* root@YOUR_DROPLET_IP:/var/www/noteskart/
```

## Step 3: Install Dependencies & Build

```bash
cd /var/www/noteskart

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies and build
cd ../frontend
npm install
npm run build

cd ..
```

## Step 4: Configure Environment

The `.env` file in `backend/` is already configured. Verify it on the server:

```bash
cat /var/www/noteskart/backend/.env
```

It should contain:
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://studyswap_db_user:Gaurav%407121@studyswap.tuvmhax.mongodb.net/notes
JWT_SECRET=super_secret_jwt_key_demo
FRONTEND_URL=https://noteskart.me
RAZORPAY_KEY_ID=rzp_test_STZhAh0MVDvf41
RAZORPAY_KEY_SECRET=6VSjqmnkct0TwkhOXGZ3rF1f
```

## Step 5: Start with PM2

```bash
cd /var/www/noteskart
pm2 start backend/server.js --name noteskart
pm2 save
pm2 startup    # Follow instructions to enable auto-start on reboot
```

## Step 6: Configure Nginx

```bash
nano /etc/nginx/sites-available/noteskart
```

Paste this config:

```nginx
server {
    listen 80;
    server_name noteskart.me www.noteskart.me;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/noteskart /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default    # Remove default site
nginx -t                                # Test config
systemctl restart nginx
```

## Step 7: SSL Certificate (HTTPS)

```bash
certbot --nginx -d noteskart.me -d www.noteskart.me
```

Follow the prompts to get a free Let's Encrypt SSL certificate.

## Step 8: Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pm2 logs noteskart` | View app logs |
| `pm2 restart noteskart` | Restart the app |
| `pm2 status` | Check process status |
| `pm2 monit` | Real-time monitoring |
| `nginx -t && systemctl reload nginx` | Test & reload Nginx |

## Updating the App

```bash
cd /var/www/noteskart
git pull                    # If using Git
cd frontend && npm run build
pm2 restart noteskart
```
