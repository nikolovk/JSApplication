/// <reference path="class.js" />
/// <reference path="persister.js" />
/// <reference path="jquery-2.0.2.js" />
/// <reference path="ui.js" />

var controllers = (function () {
    var rootUrl = "http://localhost:22954/api/";
    //var nickname;
    var yourColor;
    var Controller = Class.create({
        init: function () {
            this.persister = persisters.get(rootUrl);
            nickname = this.persister.nickname();
        },
        loadUI: function (selector) {
            if (this.persister.isUserLoggedIn()) {
                this.loadGameUI(selector);
            }
            else {
                this.loadLoginFormUI(selector);
            }
            this.attachUIEventHandlers(selector);
        },
        loadLoginFormUI: function (selector) {
            var loginFormHtml = ui.loginForm()
            $(selector).html(loginFormHtml);
        },
        loadGameUI: function (selector) {
            var list =
				ui.gameUI(this.persister.nickname());
            $(selector).html(list);


            this.persister.game.open(function (games) {
                var list = ui.openGamesList(games);
                $(selector + " #open-games")
					.html(list);
            }, function (error) {
                $("#error-message").html(data.responseJSON.Message);
            });

            this.persister.game.myActive(function (games) {              
                var list = ui.activeGamesList(games);

                $(selector + " #active-games").html(list);
                $(".in-progress").parents("li").append(ui.playGameButton());
            }, function (error) {
                $("#error-message").html(data.responseJSON.Message);
            });
        },
        loadGame: function (selector, gameId) {
            this.persister.game.state(gameId, function (gameState) {
                var gameHtml = ui.gameState(gameState);
                $(selector + " #game-holder").html(gameHtml)
            });
        },
        attachUIEventHandlers: function (selector) {
            var wrapper = $(selector);
            var self = this;

            wrapper.on("click", "#btn-show-login", function () {
                wrapper.find(".button.selected").removeClass("selected");
                $(this).addClass("selected");
                wrapper.find("#login-form").show();
                wrapper.find("#register-form").hide();
            });
            wrapper.on("click", "#btn-show-register", function () {
                wrapper.find(".button.selected").removeClass("selected");
                $(this).addClass("selected");
                wrapper.find("#register-form").show();
                wrapper.find("#login-form").hide();
            });

            wrapper.on("click", "#btn-login", function () {
                var user = {
                    username: $(selector + " #tb-login-username").val(),
                    password: $(selector + " #tb-login-password").val()
                }

                self.persister.user.login(user, function () {
                    self.loadGameUI(selector);
                }, function (data) {
                    $("#error-message").html(data.responseJSON.Message);
                    return false;
                });
                return false;
            });
            wrapper.on("click", "#btn-register", function () {
                var user = {
                    username: $(selector + " #tb-register-username").val(),
                    password: $(selector + " #tb-register-password").val(),
                    nickname: $(selector + " #tb-register-nickname").val()
                }

                self.persister.user.register(user, function() {
                    self.loadGameUI(selector);
                }, function (data) {
                    $("#error-message").html(data.responseJSON.Message);
                    return false;
                });
            });
            wrapper.on("click", "#btn-logout", function () {
                self.persister.user.logout(function () {
                    self.loadLoginFormUI(selector);
                });
            });

            wrapper.on("click", "#open-games-container a", function () {
                $("#game-join-inputs").remove();
                var html =
					'<div id="game-join-inputs">' +
						'<button id="btn-join-game">Join Game</button>' +
					'</div>';
                $(this).after(html);
            });
            wrapper.on("click", "#btn-join-game", function () {
                var game = {
                    id: $(this).parents("li").first().data("game-id")
                };
                $(this).remove();
                self.persister.game.join(game, function (data) {
                    $("#message").html("You join game!");

                }, function (error) {
                    $("#error-message").html(error.responseJSON.Message);
                });
            });
            wrapper.on("click", "#btn-create-game", function () {
                var game = {
                    title: $("#tb-create-title").val(),
                }
                self.persister.game.create(game, function (data) {
                    $("#message").html("Game created!");
                }, function (error) {
                    $("#error-message").html(error.responseJSON.Message);
                });
            });

            wrapper.on("click", ".btn-start-game", function () {
                var gameId = $(this).parents("li").first().data("game-id");
                $(this).remove();
                var game = {
                    id: gameId
                };
                self.persister.game.start(game, function () {
                    $("#message").html("Game started!");
                }, function (error) {
                    $("#error-message").html(error.responseJSON.Message);
                });
            });
            
            wrapper.on("click", ".btn-play-game", function () {
                var gameId = $(this).parents("li").first().data("game-id");
                $(this).remove();
                var game = {
                    id: gameId
                };
                self.persister.game.load(game, function (data) {
                    $("#game-holder").html(ui.gameField());                   
                    if (data.red.nickname == nickname) {
                        yourColor = "red";
                    } else {
                        yourColor = "blue";
                    }
                    $("#message").prepend("You play " + yourColor + "!<br>");
                    $("#message").prepend(data.inTurn + " in turn!<br>");
                    $(data.red.units).each(function (key, value) {
                        $("#cell" + value.position.x + value.position.y).addClass(value.owner);
                        if (value.type == "warrior") {
                            $("#cell" + value.position.x + value.position.y).html("W").data("id-unit",value.id);
                        } else {
                            $("#cell" + value.position.x + value.position.y).html("R").data("id-unit", value.id);
                        }
                        if (yourColor == "red" && data.inTurn == "red") {
                            $("#cell" + value.position.x + value.position.y).addClass("inMove");
                        }
                    });
                    $(data.blue.units).each(function (key, value) {
                        $("#cell" + value.position.x + value.position.y).addClass(value.owner);
                        if (value.type == "warrior") {
                            $("#cell" + value.position.x + value.position.y).html("W").data("id-unit", value.id);
                        } else {
                            $("#cell" + value.position.x + value.position.y).html("R").data("id-unit", value.id);
                        }
                        if (yourColor == "blue" && data.inTurn == "blue") {
                            $("#cell" + value.position.x + value.position.y).addClass("inMove");
                        }
                    });
                }, function (error) {
                    $("#error-message").html(error.responseJSON.Message);
                });
            });

            wrapper.on("click", ".inMove", function () {
                $(".inPlay").removeClass("inPlay");
                $("#game-holder-state").html(ui.moveType);
                $(this).addClass("inPlay");
            });

            wrapper.on("click", ".place", function () {

            });

            wrapper.on("click", ".active-games .in-progress", function () {
                self.loadGame(selector, $(this).parent().data("game-id"));
            });
        }
    });
    return {
        get: function () {
            return new Controller();
        }
    }
}());

$(function () {
    var controller = controllers.get();
    controller.loadUI("#content");
});