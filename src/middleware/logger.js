function logger(req, res, next) {
    const startTime = Date.now();
    let logged = false;

    const log = () => {
        if (logged) return;
        logged = true;
        console.log(
            `===${startTime}===\nMethod: ${req.method}\nURL: ${req.originalUrl}\nStatus: ${res.statusCode} - ${Date.now() - startTime}ms`
        );
    };

    res.on('finish', log);
    res.on('close', log);
    
    next();
}

module.exports = logger; 