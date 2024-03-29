﻿/// <reference path="persister.js" />
/// <reference path="controller.js" />

var ui = (function () {

    function buildLoginForm() {
        var html =
            '<div id="login-form-holder">' +
            '<div id="error-message"></div>' +
				'<form>' +
					'<div id="login-form">' +
						'<label for="tb-login-username">Username: </label>' +
						'<input type="text" id="tb-login-username"><br />' +
						'<label for="tb-login-password">Password: </label>' +
						'<input type="text" id="tb-login-password"><br />' +
						'<button id="btn-login" class="button">Login</button>' +
					'</div>' +
					'<div id="register-form" style="display: none">' +
						'<label for="tb-register-username">Username: </label>' +
						'<input type="text" id="tb-register-username"><br />' +
						'<label for="tb-register-nickname">Nickname: </label>' +
						'<input type="text" id="tb-register-nickname"><br />' +
						'<label for="tb-register-password">Password: </label>' +
						'<input type="text" id="tb-register-password"><br />' +
						'<button id="btn-register" class="button">Register</button>' +
					'</div>' +
					'<a href="#" id="btn-show-login" class="button selected">Login</a>' +
					'<a href="#" id="btn-show-register" class="button">Register</a>' +
				'</form>' +
            '</div>';
        return html;
    }

    function buildGameUI(nickname) {
        var html = '<span id="user-nickname">' +
				nickname +
		'</span>' +
		'<button id="btn-logout">Logout</button><br/>' +
                    '<div id="error-message"></div>' +
		'<div id="create-game-holder">' +
			'Title: <input type="text" id="tb-create-title" />' +
			//'Password: <input type="text" id="tb-create-pass" />' +
			'<button id="btn-create-game">Create Game</button>' +
		'</div>' +
                            '<div id="message"></div>' +
		'<div id="open-games-container">' +
			'<h2>Open</h2>' +
			'<div id="open-games"></div>' +
		'</div>' +
		'<div id="active-games-container">' +
			'<h2>Active</h2>' +
			'<div id="active-games"></div>' +
		'</div>' +
		'<div id="game-holder">' +
		'</div>';
        return html;
    }

    function buildOpenGamesList(games) {
        if (games && games.length > 0) {
            var list = '<ul class="game-list open-games">';
            for (var i = 0; i < games.length; i++) {
                var game = games[i];
                list +=
                    '<li data-game-id="' + game.id + '">' +
                        '<a href="#" >' +
                            $("<div />").html(game.title).text() +
                        '</a>' +
                        '<span> by ' +
                            game.creator +
                        '</span>' +
                    '</li>';
            }
            list += "</ul>";
        } else {
            list = '<div class="empty-list">No open games</div>';
        }

        return list;
    }

    function buildActiveGamesList(games) {
        if (games && games.length > 0) {
            var gamesList = Array.prototype.slice.call(games, 0);
            gamesList.sort(function (g1, g2) {
                if (g1.status == g2.status) {
                    return g1.title > g2.title;
                }
                else {
                    if (g1.status == "in-progress") {
                        return -1;
                    }
                }
                return 1;
            });
            var nickname = $("#user-nickname").html();
            var list = '<ul class="game-list active-games">';
            for (var i = 0; i < gamesList.length; i++) {
                var game = gamesList[i];
                list +=
                    '<li data-game-id="' + game.id + '">' +
                        '<a href="#" class="' + game.status + '">' +
                            $("<div />").html(game.title).text() +
                        '</a>' +
                        '<span> by ' +
                            game.creator +
                        '</span>';
                if (game.creator == nickname && game.status == "full") {
                    list += '<span class="game-start-inputs">' +
						'<button class="btn-start-game">Start Game</button>' +
					'</span>';
                }
                list += '</li>';
            }
            list += "</ul>";
        } else {
            list = '<div class="empty-list">No active games</div>';
        }
        return list;
    }

    function playGameButton() {
        var button = '<span class="game-play-inputs">' +
                         '<button class="btn-play-game">Play Game</button>' +
                     '</span>';
        return button;
    }

    function buildGuessTable(guesses) {
        var tableHtml =
			'<table border="1" cellspacing="0" cellpadding="5">' +
				'<tr>' +
					'<th>Number</th>' +
					'<th>Cows</th>' +
					'<th>Bulls</th>' +
				'</tr>';
        for (var i = 0; i < guesses.length; i++) {
            var guess = guesses[i];
            tableHtml +=
				'<tr>' +
					'<td>' +
						guess.number +
					'</td>' +
					'<td>' +
						guess.cows +
					'</td>' +
					'<td>' +
						guess.bulls +
					'</td>' +
				'</tr>';
        }
        tableHtml += '</table>';
        return tableHtml;
    }

    function buildGameState(gameState) {
        var html =
			'<div id="game-state" data-game-id="' + gameState.id + '">' +
				'<h2>' + gameState.title + '</h2>' +
				'<div id="blue-guesses" class="guess-holder">' +
					'<h3>' +
						gameState.blue + '\'s gueesses' +
					'</h3>' +
					buildGuessTable(gameState.blueGuesses) +
				'</div>' +
				'<div id="red-guesses" class="guess-holder">' +
					'<h3>' +
						gameState.red + '\'s gueesses' +
					'</h3>' +
					buildGuessTable(gameState.redGuesses) +
				'</div>' +
		'</div>';
        return html;
    }

    function buildGameField() {
        var table = '<div id="game-holder-state"></div><table id="field-table">';
        for (var row = 0; row <= 8; row++) {
            table += '<tr>';
            for (var col = 0; col <= 8; col++) {
                table += '<td id="cell' + row + col + '"></td>';
            }
            table += '</tr>';
        }
        table += '</table>';
        return table;
    }

    function moveType() {
      var moveType =  'Choose move type: <select name="move-type">' +
       '<option value="attack">attack</option>' +
        '<option value="defense">defense</option>' +
      ' <option value="move" selected="selected">move</option>' +
        '</select>';
       return moveType;
    }

    return {
        gameUI: buildGameUI,
        openGamesList: buildOpenGamesList,
        loginForm: buildLoginForm,
        activeGamesList: buildActiveGamesList,
        gameField: buildGameField,
        playGameButton: playGameButton,
        moveType: moveType
    }

}());