## Steps to setup

#### `npm install`

Run npm install in this directory and /compliment to add required modules.

#### `touch .env`

Create a file named .env to store environment variables MONGO_HOST, etc.

#### `touch compliment/SERVER.js`

In /compliment, create a file named SERVER.js with module.exports containing the link to your server.

### S3 Remote Storage

If using S3 and multerS3 to remotely store file uploads, the BUCKET, S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY, and AWS_REGION environment variables must be added to the .env file.
