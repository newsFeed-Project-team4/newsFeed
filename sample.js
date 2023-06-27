const { PutObjectCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');
const s3Client = require('./libs/s3Client.js');

const params = {
  Bucket: 'awsbucket-0728',
  Key: 'test.txt',
  Body: 'Hello World!',
};

const run = async () => {
  try {
    const data = await s3Client.send(new CreateBucketCommand({ Bucket: params.Bucket }));
    console.log(data);
    console.log(data.Location);
    return data;
  } catch (error) {
    console.log(error);
  }

  try {
    const results = await s3Client.send(new PutObjectCommand(params));
    console.log(
      'Successfully created ' +
        params.Key +
        ' and uploaded it to ' +
        params.Bucket +
        '/' +
        params.Key,
    );
    return results;
  } catch (error) {
    console.log(error);
  }
};

run();
