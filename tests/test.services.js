'use strict';

define(function (require) {
//    mocha.timeout(0);

    var chai = require('tests/chai');
    var User = require('scripts/domain/User'),
        Cue = require('scripts/domain/Cue'),
        CueCategory = require('scripts/domain/CueCategory'),
        UserService = require('scripts/service/UserService'),
        CueCategoryService = require('scripts/service/CueCategoryService'),
        UserCueCategoryService = require('scripts/service/UserCueCategoryService'),
        UserCueService = require('scripts/service/UserCueService');

    describe('service', function () {
        var token,
            cueCategoryIds = [];

        describe('CueCategoryService', function () {
            it('get', function (done) {

                var cueCategoryService = new CueCategoryService();
                cueCategoryService.get(function (err, cueCategories) {
                    chai.assert.isNull(err, err);
                    chai.assert.isArray(cueCategories);

                    // after json serialization CueCategory object becomes a plain hash
//                    chai.assert.instanceOf(cueCategories[0], CueCategory);

                    for (var i = 0; i < 5; i++) {
                        cueCategoryIds[i] = cueCategories[i].id;
                    }

                    done();
                });
            });
        });

        describe('UserService', function () {
            it('post and get', function (done) {
                var userService = new UserService();
                userService.post(function (err, user) {
                    chai.assert.isNull(err, err);
                    chai.assert.instanceOf(user, User);

                    token = user.token;

                    userService.get(user.token, function (err, user) {
                        chai.assert.isNull(err, err);
                        chai.assert.instanceOf(user, User);

                        done();
                    });
                });
            });
        });

        describe('UserCueCategoryService', function () {
            it('put and get', function (done) {

                var userCueCategoryService = new UserCueCategoryService();

                userCueCategoryService.put(token, cueCategoryIds, function (err) {
                    chai.assert.isNull(err, err);

                    userCueCategoryService.get(token, function (err, cueCategories) {
                        chai.assert.isNull(err, err);
                        chai.assert.isArray(cueCategories);

                        var mustBeEmpty = cueCategoryIds;
                        var index;
                        for (var i = 0; i < cueCategories.length; i++) {
                            index = mustBeEmpty.indexOf(cueCategories[i].id);
                            if (-1 === index) {
                                chai.assert.ok(false);
                            } else {
                                mustBeEmpty.splice(index, 1);
                            }
                        }

                        chai.assert(0 === mustBeEmpty.length);


                        done();
                    });
                });

            });
        });

        describe('UserCueService', function () {
            it('get and put', function (done) {

                var userCueService = new UserCueService();

                userCueService.get(token, 0, function (err, cues) {
                    chai.assert.isNull(err, err);
                    chai.assert.isArray(cues);

                    var initialNumberOfCues = cues.length;
                    if (initialNumberOfCues < 2) {
                        chai.assert(false, 'Can not test `userCueService.put` as we don\'t obtain enough cues ' +
                            'from the server in the first place');
                    }

                    var cueIds = [cues[0].id];
                    userCueService.put(token, cueIds, function (err) {
                        chai.assert.isNull(err, err);

                        userCueService.get(token, 0, function (err, cues) {
                            chai.assert.isNull(err, err);

                            for (var i = 0; i < cues.length; i++) {
                                if (cueIds.indexOf(cues[i].id) > -1) {
                                    chai.assert(false, 'We got a cue from server which we marked as viewed!');
                                }
                            }

                            done();
                        });
                    });
                });
            });
        });
    });

});

