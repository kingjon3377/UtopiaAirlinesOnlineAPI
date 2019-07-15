# Utopia Airlines Online API

This project provides the middleware API for unmediated ticket purchases and
cancellations in the Utopia Airlines project.

## Setup

Create `.env` file in the project's root, or anywhere that
[dotenv](https://www.npmjs.com/package/dotenv) will find it, containing your
values for all the keys shown in `default.env`.

This code is now designed to run on AWS Lambda; create a Zip file containing
`index.js`, your `.env`, and the contents of the `controller`, `util`, and
`node_modules` directories and use that as the code for the Lambda function.
