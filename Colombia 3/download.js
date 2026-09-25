const fs = require('fs');
const https = require('https');

const links = [
    'https://www.colombiaaprende.edu.co/sites/default/files/2020-11/DBA_Matematicas-min.pdf',
    'https://www.colombiaaprende.edu.co/sites/default/files/2020-11/DBA_Ingles-min.pdf',
    'https://www.colombiaaprende.edu.co/sites/default/files/2020-11/DBA_Transicion-min.pdf',
    'https://www.colombiaaprende.edu.co/sites/default/files/2020-11/DBA_TRANSICION-Y-PRIMARIA_Ingl%C3%A9s-min.pdf'
];

links.forEach(urlStr => {
    let filename = decodeURIComponent(urlStr.split('/').pop());
    const file = fs.createWriteStream(filename);
    https.get(urlStr, response => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Downloaded ' + filename);
        });
    }).on('error', err => {
        fs.unlink(filename, () => {});
        console.error('Error downloading ' + urlStr + ': ' + err.message);
    });
});
