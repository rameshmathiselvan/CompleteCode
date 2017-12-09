/**
 * Created by Barathiraja on 08-05-2016.
 */

exports.validatingErrors = function (err) {
    var errors = {};
    console.log(err);
    if (err) {
        switch (err.name) {
            case 'ValidationError':
                for (field in err.errors) {
                    switch (err.errors[field].type) {
                        case 'required':
                            errors[field] = [field] + ' is Required';
                            break;
                        case 'user defined':
                            errors[field] = 'Already Exist';
                            break;
                        case 'enum':
                            errors[field] = 'Invalid ' + [field];
                    }
                }
                break;
            case 'CastError':
                console.log(err.type);
                if (err.type === 'number') {
                    errors[err.path] = [err.path] + ' must be a Number';
                }
                if (err.type === 'date') {
                    errors[err.path] = [err.path] + ' must be a Valid Date';
                }
                if (err.type === 'ObjectId') {
                    errors[err.path] = [err.path] + ' is NotValid';
                }
                break;
        }
    }
    return errors;
};