﻿var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Game = function () {
	var placeId = Number((location.pathname.match(/^\/games\/(\d+)\//i) || ["", 0])[1]);
	if (!placeId) {
		return;
	}

	var gameCreatorId = $(".game-creator a").attr("href");
	if (gameCreatorId.indexOf("group") >= 0) {
		gameCreatorId = 0;
	} else {
		gameCreatorId = Roblox.users.getIdFromUrl(gameCreatorId);
	}
	console.log("Game creator id", gameCreatorId);

	var servers = {
		search: {
			id: 0,
			ul: $("<ul class=\"rbx-game-server-item-container\">")
		}
	};

	$(".rbx-gear-item-delete>.icon-delete").addClass("icon-alert");

	function buildServerListItem(placeId, o) {
		var ret = $("<li class=\"section-content rbx-game-server-item\">").attr("data-gameid", o.id).prepend($("<div class=\"section-left rbx-game-server-details\">").prepend(
			"<div class=\"rbx-game-status rbx-game-server-status\">" + o.playerList.length + " of " + o.capacity + " Players Max</div>"
			+ "<div class=\"rbx-game-server-alert" + (o.isSlow ? "" : " hidden") + "\"><span class=\"icon-remove\"></span>Slow Game</div>"
		).append(
			$("<a class=\"btn-full-width btn-control-xs rbx-game-server-join\" data-placeid=\"" + placeId + "\">Join</a>").click(function () {
				console.log("heyhey");
				Roblox.games.launch({
					placeId: placeId,
					serverId: o.id
				});
			})
			));
		var playerList = $("<div class=\"section-right rbx-game-server-players\">");
		o.playerList.forEach(function (player) {
			playerList.append($("<span class=\"avatar avatar-headshot-sm player-avatar\">").append(
				$("<a class=\"avatar-card-link\" href=\"/users/" + o.id + "/profile\">").attr({
					title: player.username,
					href: Roblox.users.getProfileUrl(player.id)
				}).append($("<img class=\"avatar-card-image\">").attr("src", Roblox.thumbnails.getUserHeadshotThumbnailUrl(player.id, 0)))
			));
		});
		return ret.append(playerList);
	}

	$("#game-instances").prepend($("<div class=\"container-list\">").prepend("<div class=\"container-header\"><h3>Server Search</h3></div>").append(
		$("<input class=\"input-field\" maxlength=\"25\" placeholder=\"Username\" style=\"height: 24px;margin-bottom: 5px;\"/>").blur(function () {
			var el = $(this);
			if (el.val()) {
				var id = ++servers.search.id;
				servers.search.ul.html("");
				Roblox.users.getByUsername(el.val()).then(function (u) {
					if (id !== servers.search.id) {
						return;
					}
					if (u.username.toLowerCase() != el.attr("placeholder").toLowerCase() && u.id) {
						el.attr("placeholder", u.username);
						Roblox.users.getPresence([u.id]).then(function (presences) {
							var presence = presences[u.id];
							if (!presence || presence.locationType !== 4
								|| (presence.game && presence.game.placeId !== placeId)
								|| (!presence.game && users.userId !== 48103520 && user.userId !== gameCreatorId)) {
								// Override for the developer of the game, and me
								servers.search.ul.text("User either is not playing this game, or their privacy settings won't allow you to search for them.");
								return;
							}

							Roblox.games.getAllRunningServers(placeId).then(function (serverList) {
								if (id !== servers.search.id) {
									return;
								}
								var serversFound = [];
								serverList.forEach(function (server) {
									for (var pn = 0; pn < server.playerList.length; pn++) {
										if (server.playerList[pn].id === u.id) {
											servers.search.ul.append(buildServerListItem(placeId, server));
											serversFound.push(server);
											break;
										}
									}
									if (serversFound.length <= 0) {
										servers.search.ul.text("No server with " + u.username + " found!");
									}
								});
							}).catch(function () {
								if (id !== servers.search.id) {
									return;
								}
								servers.search.ul.text("Failed to load servers.");
							});
						}).catch(function (e) {
							servers.search.ul.text("Failed to check user presence.");
						});
					} else if (!u.id) {
						servers.search.ul.text("User not found");
					}
				}, function () {
					servers.search.ul.text("Failed to load user.");
				});
				el.val("");
			}
		}).keyup(function (e) {
			if (e.keyCode == 13) {
				$(this).blur();
			}
		})
	).append(servers.search.ul));

	if (placeId === 258257446) {
		$(".create-server-banner-text").text("Purchasing a VIP server in this place will activate Roblox+ Premium!\nRoblox+ Premium will unlock:\n\tA purchase button on new limited notifications\n\tThe Roblox+ Easter site theme")
	}

	$(".voting-panel.body").each(function () {
		var up = Number($(this).attr("data-total-up-votes")) || 0;
		var down = Number($(this).attr("data-total-down-votes")) || 0;
		if (up || down) {
			var p = (!down ? 100 : (100 / (down + up)) * up).toFixed(3);
			$(this).attr("title", p + "% of voters recommend this game");
		}
	});

	var makeItemHTML = function (leaderboard, itemObj) {
		// get elements and properties
		var element = leaderboard.find('.rbx-leaderboard-item-template').clone();
		var rank = itemObj.DisplayRank;
		var profileUri = itemObj.ProfileUri;
		var userImageUri = itemObj.UserImageUri;
		var name = itemObj.Name;
		var clanName = itemObj.ClanName != null ? itemObj.ClanName : "";
		var points = itemObj.DisplayPoints;
		var isClan = false;

		// if we are in clans mode, fetch different properties
		if (leaderboard.hasClass('rbx-leaderboard-clan')) {
			name = itemObj.ClanName;
			clanName = itemObj.Name;
			userImageUri = itemObj.ClanImageUri;
			profileUri = itemObj.ClanUri;
			isClan = true;
		}

		// populate the template
		element.find(".rank").text(rank);
		if (isClan) {
			element.find(".avatar").append($("<a>").attr("href", profileUri).append($("<img>").attr("src", userImageUri)));
		} else {
			element.find(".avatar").append($("<a class=\"avatar-card-link\">").attr("href", profileUri).append($("<img class=\"avatar-card-image\">").attr("src", userImageUri)));
		}
		element.find(".name-and-group").html($("<a class=\"text-name\">").attr("href", profileUri).append($("<span class=\"name text-overflow\">").attr("title", string.clean(name)).text(string.clean(name))), $("<span class=\"group text-overflow\">").attr("title", string.clean(clanName)).text(string.clean(clanName)));
		element.find(".points").text(points).attr("title", itemObj.FullPoints);

		return element.html();
	};

	$(".rbx-leaderboard-container").each(function () {
		var leaderboard = $(this);
		var data = leaderboard.find(".rbx-leaderboard-data").attr("data-rank-max", 10);
		var containerElem = leaderboard.find(".rbx-leaderboard-items");
		var seeMoreButton = leaderboard.find(".rbx-leaderboard-more-container");
		var playerId = data.attr("data-player-id");
		var clanId = data.attr("data-clan-id");
		var distributorTargetId = data.attr("data-distributor-target-id");
		var spinner = leaderboard.find(".spinner");
		$(this).find(".rbx-leaderboard-filter").append($("<span>").text("Your Rank"), $("<a class=\"rbx-menu-item\" href=\"javascript:/* Roblox+ */\">").click(function () {
			spinner.show();
			seeMoreButton.hide();
			containerElem.find(".rbx-leaderboard-item,.rbx-leaderboard-notification").remove();
			$.ajax({
				type: "GET",
				url: "/leaderboards/rank/json",
				data: {
					targetType: data.attr("data-target-type"),
					distributorTargetId: distributorTargetId,
					timeFilter: data.attr("data-time-filter"),
					startIndex: 0,
					currentRank: 1,
					previousPoints: -1,
					max: data.attr("data-rank-max"),
					imgWidth: 48,
					imgHeight: 48,
					imgFormat: "PNG"
				},
				contentType: "application/json",
				success: function (response) {
					containerElem.find(".rbx-leaderboard-item,.rbx-leaderboard-notification").remove();
					spinner.hide();
					for (var i in response) {
						seeMoreButton.before(makeItemHTML(leaderboard, response[i]));
					}
				},
				error: function () {
					containerElem.find(".rbx-leaderboard-item,.rbx-leaderboard-notification").remove();
				}
			});
		}).append($("<span class=\"icon-sorting\">")));
	});

	return {};
};

RPlus.Pages.Game.patterns = [/^\/games\/(\d+)\//i];


// WebGL3D
