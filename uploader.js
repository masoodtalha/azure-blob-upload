app.post('/chrome-upload', (req, res) => {
    if (!fs.existsSync('chrome-uploads/')){
      fs.mkdirSync('chrome-uploads');
    }
    const filename = uniqid() + "." + 'png';
    let blobService = azure.createBlobService();
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
      const _imageOnDisc = "chrome-uploads/" + uniqid() + "." + 'png';
      const resizedPathLarge = "chrome-uploads/" + uniqid() + '.png';
      const resizedPathSmall = "chrome-uploads/" + uniqid() + '.png';

      var buffer = fields['image'][0].trim();
      var base64Data = buffer.replace(/^data:image\/[a-z]+;base64,/, "");
      require("fs").writeFile(_imageOnDisc, base64Data, 'base64', function(err) {
        if (err) console.log(err);
        gm(_imageOnDisc)
        .resize(600, 600)
        .compress('BZip')
        .write(resizedPathLarge, function (err) {
          blobService.createBlockBlobFromLocalFile('files', `large_${filename}`, resizedPathLarge, function(error, result, response) {
            if (error) {
              console.log(error)
            }else{
              gm(_imageOnDisc)
              .resize(250, 155)
              .compress('BZip')
              .write(resizedPathSmall, function (err) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                blobService.createBlockBlobFromLocalFile('files', `small_${filename}`, resizedPathSmall, function(error, result, response) {
                  if (error) {
                    res.status(400).send({ error: error })
                    res.end();
                  }else{
                    res.status(201).send({fileName: filename})
                  }
                });
              });
            }
          });
        });
      });

    });
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.status(200).send("There we go man");
});
