/**
 * Created by Sundar on 12/8/16.
 */
var User = require('../models/User');

exports.saveAdmin = function() {
    console.log('Saving User');

    User.findOne({'email': new RegExp('^' + 'associate@fewd.com' + '$', "i")}, function(err, user) {
        if (user == null) {
            var newUser = new User;
            newUser.email = 'associate@fewd.com';
            newUser.password = 'welcome123';
            newUser.save(function(saveErr, saveUser) {
                if (saveErr) {
                    console.log(saveErr);
                    return;
                }
            });
            return;
        } else {
            console.log('Done save');
        }
    });
};