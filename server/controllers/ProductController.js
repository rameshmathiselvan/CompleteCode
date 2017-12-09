/**
 * Created by Sundar on 12/8/16.
 */
var Product = require('../models/Product');
var HttpStatus = require('http-status');
var Validation = require('./Validation');
var ProductController = require('./ProductController.js');
var exec = require('child_process').exec;
var fs = require('node-fs');

//Saves Product
exports.save = function(req, res) {
    var newProduct = new Product();
    newProduct.name = req.body.name;
    newProduct.category = req.body.category;
    newProduct.description = req.body.description;
    newProduct.price = req.body.price;
    newProduct.save(function(saveErr, saveProduct) {
        if (saveErr) {
            res.status(HttpStatus.BAD_REQUEST).json({
                status: 'failure',
                code: HttpStatus.BAD_REQUEST,
                data: '',
                error: Validation.validatingErrors(saveErr)
            });
            return;
        }
        ProductController.saveProductImg(saveProduct);
        res.status(HttpStatus.OK).json({
            status: 'success',
            code: HttpStatus.OK,
            data: saveProduct,
            error: ''
        });
    });
};

exports.saveProductImg = function(product){           // Saves Picture of a Product.

    Product.findById(product._id,function(err,picture){
        if (err) {
            console.log(err);
            return;
        }
        var fs = require('node-fs');

        fs.readFile('./public/images/product.png', function (dataErr, data) {
            if(data) {
                if(!fs.existsSync('./public/images/Product')){
                    exec('mkdir ./public/images/Product', function (error, stdout, stderr) {
                    });
                }
                var imgExtension = 'png';
                var imgPath = './public/images/Product/'+product._id+"_"+"Product"+"."+imgExtension;
                if(fs.existsSync(imgPath)){
                    fs.unlinkSync(imgPath);
                }
                fs.writeFileSync(imgPath,data);
                picture.productImg.fileName = product._id+"_"+"Product"+"."+imgExtension;
                picture.productImg.filePath = imgPath;
                picture.productImg.fileType = imgExtension;
                picture.save(function (saveerr, savePicture) {
                    if (saveerr) {
                        console.log(saveerr);
                        return;
                    }
                    //console.log(savePicture);
                    return;
                });
            }
        });
    });
};

exports.fetch = function(req, res) {

    Product.findById(req.params.id, function(err, product) {
        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: 'failure',
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                data: '',
                error: 'unexpected error in accessing data'
            });
            return;
        }
        if (product == null) {
            res.status(HttpStatus.BAD_REQUEST).json({
                status: 'failure',
                code: HttpStatus.BAD_REQUEST,
                data: '',
                error: 'Product not found'
            });
            return;
        }
        res.status(HttpStatus.OK).json({
            status: 'success',
            code: HttpStatus.OK,
            data: product,
            error: ''
        });
    });
};

exports.list = function(req, res) {

    Product.find({}, function(err, products) {

        if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: 'failure',
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                data: '',
                error: 'unexpected error in accessing data'
            });
            return;
        }
        res.status(HttpStatus.OK).json({
            status: 'success',
            code: HttpStatus.OK,
            data: products,
            error: ''
        });

    })

};

exports.update = function(req, res) {

    Product.findById(req.params.id, function(err, product) {

        if (err) {

            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: 'failure',
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                data: '',
                error: 'unexpected error in accessing data'
            });

            return;
        }
        if (product == null) {
            res.status(HttpStatus.BAD_REQUEST).json({
                status: 'failure',
                code: HttpStatus.BAD_REQUEST,
                data: '',
                error: 'Product not found'
            });
            return;
        }
        product.name = req.body.name;
        product.category = req.body.category;
        product.description = req.body.description;
        product.price = req.body.price;
        product.save(function(saveErr, saveProduct) {
            if (saveErr) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    status: 'failure',
                    code: HttpStatus.BAD_REQUEST,
                    data: '',
                    error: Validation.validatingErrors(saveErr)
                });
                return;
            }
            res.status(HttpStatus.OK).json({
                status: 'success',
                code: HttpStatus.OK,
                data: saveProduct,
                error: ''
            });
        });
    })
};

exports.remove = function(req, res) {

    Product.findByIdAndRemove(req.params.id, function(err, product) {

        if (err) {

            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: 'failure',
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                data: '',
                error: 'unexpected error in accessing data'
            });

            return;
        }

        if (product == null) {
            res.status(HttpStatus.BAD_REQUEST).json({
                status: 'failure',
                code: HttpStatus.BAD_REQUEST,
                data: '',
                error: 'Product not found'
            });
            return;
        }
        res.status(HttpStatus.OK).json({
            status: 'success',
            code: HttpStatus.OK,
            data: 'Product Removed',
            error: ''
        });
    })
};

exports.changeProfileImage = function(req, res){
    //console.log(req.files);
    var updateImgPath =  function(file,product,imgName){
        var imgExtension = file.originalFilename.split('.')[1];
        var imgPath = './public/images/Product/'+product+"_"+imgName+"."+imgExtension;
        return imgPath;
    };

    var updatefileName =  function(file,product,imgName){
        var imgExtension = file.originalFilename.split('.')[1];
        var imgFile = product+"_"+imgName+"."+imgExtension;
        return imgFile;
    };

    var writeImg = function(file,filePath){
        var imgData = fs.readFileSync(file.path);
        fs.writeFileSync(filePath,imgData);
        fs.unlinkSync(file.path);
    };

    Product.findById(req.params.id,function(err,profilePic){
        if(err){
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: 'Unexpected error accessing data', code: HttpStatus.INTERNAL_SERVER_ERROR,
                status: 'failure', data : ''});
            return;
        }
        if(profilePic == null){
            res.status(HttpStatus.NOT_FOUND).json({error: 'Product Image not found', code: HttpStatus.NOT_FOUND,
                status: 'failure', data : ''});
            return;
        }

        if(req.files.file){
            console.log("Product image");
            profilePic.productImg.fileName =  updatefileName(req.files.file,profilePic._id,"Product");
            profilePic.productImg.filePath =  updateImgPath(req.files.file,profilePic._id,"Product");
            profilePic.productImg.fileType =  profilePic.productImg.filePath.split('.')[2];
            profilePic.save(function(updateErr,updateProfilePic){
                if(updateErr){
                    fs.unlinkSync(req.files.file.path);
                    res.status(HttpStatus.BAD_REQUEST).json({error: Validation.validatingErrors(updateErr), code: HttpStatus.BAD_REQUEST,
                        status: 'failure', data : ''});
                    return;
                }
                if(fs.existsSync(updateProfilePic.productImg.filePath)){
                    //console.log(updateProfilePic.productImg.filePath);
                    fs.unlinkSync(updateProfilePic.productImg.filePath);
                }
                writeImg(req.files.file,updateProfilePic.productImg.filePath);
                res.status(HttpStatus.OK).json({status: 'success', code: HttpStatus.OK,
                    data : 'Product image updated', error: ''});
            })
        }
    });
};

exports.fetchProductImg = function (req,res) {

    Product.findById(req.params.id,function(err,patientDoc){
        if (err) {

            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: 'failure',
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                data: '',
                error: 'unexpected error in accessing data'
            });
            return;
        }
        if(patientDoc == null){
            res.status(HttpStatus.NOT_FOUND).json({
                status: 'failure',
                code: HttpStatus.NOT_FOUND,
                error:'Patient Document not found'
            });
            return;
        }
        res.end(fs.readFileSync(patientDoc.productImg.filePath));
    })
};

exports.removeProductImg = function (req,res) {
    var imageDetails;
    Product.findById(req.params.id, function (err, product) {
        if (err) {

            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: 'failure',
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                data: '',
                error: 'unexpected error in accessing data'
            });
            return;
        }

        if(product == null){
            res.status(HttpStatus.NOT_FOUND).json({
                status: 'failure',
                code: HttpStatus.NOT_FOUND,
                error:'Product not found'
            });
            return;
        }
        imageDetails=product.productImg;
        product.productImg={};
        product.save(function(saveErr, saveProduct) {
            if (saveErr) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    status: 'failure',
                    code: HttpStatus.BAD_REQUEST,
                    data: '',
                    error: Validation.validatingErrors(saveErr)
                });
                return;
            }
            fs.unlink(imageDetails.filePath, function (err) {
                if (!err) {
                    res.status(HttpStatus.OK).json({
                        status: 'success',
                        code: HttpStatus.OK,
                        error:'Patient Document Removed'
                    });

                    return;
                };
                throw err;
            });
        });
    });
};

exports.saveProducts = function(req,res){
    var products = [{name:'Moto G Plus, 4th Gen (Black, 32 GB)',category:'Smartphones',description:'Great pictures make all the difference. That’s why there’s the new Moto G Plus, 4th Gen. It gives you a 16 MP camera with laser focus and a whole lot more, so you can say goodbye to blurry photos and missed shots. Instantly unlock your phone using your unique fingerprint as a passcode. Get up to 6 hours of power in just 15 minutes of charging, along with an all-day battery. And get the speed you need now and in the future with a powerful octa-core processor.',price:14999},
        {name:'Avs Bean Bags AVS339',category:'Furniture',description:'This is a giant bean bag chair featuring a high back and deep base for ultimate comfort and support, even for tall adults. Made from quality faux leather to provide extra comfort to an already massive bean bag. Great for watching films, reading, relaxing or even having a little afternoon snooze!"',price:790},
        {name:'Harry Potter and the Cursed Child',category:'Books',description:'The Eighth Story. Nineteen Years Later.Based on an original new story by J.K. Rowling, John Tiffany and Jack Thorne, a new play by Jack Thorne.',price:569},
        {name:'Logitech Wireless Speaker',category:'Speakers',description:'Rocking sound Crystal clear sound. Pump up the volume and enjoy! Connect and play Wirelessly connect, stream music, manage phone calls and control volume. Take it anywhere Perfect for life on the go. Take it on the road or relax and listen at home. Design In five bold colors, this unique design is sure to turn some heads 5 hour Battery Enjoy 5 hours of continuous play without recharging. Recharge the built-in lithium-ion battery with the convenience of the included micro-USB cable and rock on.',price:1558}];
    products.forEach(function(product){
        Product.findOne({name:product.name},function(err,detail){
            if(err) console.log(err);
            if(detail) console.log('Already Exist');
            if(!detail){
                var newProduct = new Product();
                newProduct.name = product.name;
                newProduct.category = product.category;
                newProduct.description = product.description;
                newProduct.price = product.price;
                newProduct.save(function(saveErr, saveProduct) {
                    if (saveErr) {
                        console.log(saveErr);
                        return;
                    }
                    ProductController.saveProductImg(saveProduct);
                    console.log('Saved')
                });
            }
        })
    })
};