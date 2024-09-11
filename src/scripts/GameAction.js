function action(direction, additionalParam) {
	if (paused) return;//hardChoice
	if (inBattle && direction == 6) {
		// Attack button clicked
		beginNewRound();
		return;
	}
	let _unit;
	switch (direction) {
		case 1: // Up
			// check collision
			boarding = playerX == shipX && playerY-1 == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX, playerY-1, TileType.LAND);
			if (isPassable(playerX, playerY-1) || boarding || landing) {
				_unit = getUnit(playerX, playerY-1);
				if (_unit && _unit.type == UnitType.CASTLE && _unit.origin > 1) {
					prepareCastleSiegeDialog(_unit);
					return;
				}
				if (_unit && _unit.type > UnitType.SHIPRIGHT && _unit.type < UnitType.CASTLE) {
					prepareSurfaceBattle(_unit);
					return;
				}
				unitsData[playerY][playerX] = landing ? UnitType.SHIPLEFT : gamePlayer.overlay;
				playerY --;
				gamePlayer.y --;
				if (!onFoot && !landing) gameShip.y --;
				if (playerY < jump) {// TODO: fix wrapping or make the map constrained
					playerY = boardWidth-1;
					gamePlayer.y += boardWidth-jump;
				}
				tween.transitionY = -1;
				TweenFX.to(tween, 6, {transitionY: 0}, e => doFrameAnimationMove(), e => finalizeMove(1));
				prepareToMove(1);
			}

			break;
		case 2: // Right
			// check collision
			boarding = playerX+1 == shipX && playerY == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX+1, playerY, TileType.LAND);
			if (isPassable(playerX+1, playerY) || boarding || landing) {
				_unit = getUnit(playerX+1, playerY);
				if (_unit && _unit.type == UnitType.CASTLE && _unit.origin > 1) {
					prepareCastleSiegeDialog(_unit);
					return;
				}
				if (_unit && _unit.type > UnitType.SHIPRIGHT && _unit.type < UnitType.CASTLE) {
					prepareSurfaceBattle(_unit);
					return;
				}
				unitsData[playerY][playerX] = landing ? UnitType.SHIPUP : gamePlayer.overlay;
				playerX ++;
				gamePlayer.x ++;
				if (!onFoot && !landing) gameShip.x ++;
				if (playerX > boardWidth-1) {
					playerX = jump;
					gamePlayer.x -= boardWidth-jump;
				}
				tween.transitionX = 1;
				TweenFX.to(tween, 6, {transitionX: 0}, e => doFrameAnimationMove(), e => finalizeMove(2));
				prepareToMove(2);
			}

			break;
		case 3: // Down
			// check collision
			boarding = playerX == shipX && playerY+1 == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX, playerY+1, TileType.LAND);
			if (isPassable(playerX, playerY+1) || boarding || landing) {
				_unit = getUnit(playerX, playerY+1);
				if (_unit && _unit.type == UnitType.CASTLE && _unit.origin > 1) {
					prepareCastleSiegeDialog(_unit);
					return;
				}
				if (_unit && _unit.type > UnitType.SHIPRIGHT && _unit.type < UnitType.CASTLE) {
					prepareSurfaceBattle(_unit);
					return;
				}
				unitsData[playerY][playerX] = landing ? UnitType.SHIPRIGHT : gamePlayer.overlay;
				playerY ++;
				gamePlayer.y ++;
				if (!onFoot && !landing) gameShip.y ++;
				if (playerY > boardWidth-1) {
					playerY = jump;
					gamePlayer.y -= boardWidth-jump;
				}
				tween.transitionY = 1;
				TweenFX.to(tween, 6, {transitionY: 0}, e => doFrameAnimationMove(), e => finalizeMove(3));
				prepareToMove(3);
			}

			break;
		case 4: // Left
			// check collision
			boarding = playerX-1 == shipX && playerY == shipY && onFoot;
			landing = !onFoot && !isPassable(playerX-1, playerY, TileType.LAND);
			if (isPassable(playerX-1, playerY) || boarding || landing) {
				_unit = getUnit(playerX-1, playerY);
				if (_unit && _unit.type > UnitType.SHIPRIGHT && _unit.type < UnitType.CASTLE) {
					prepareCastleSiegeDialog(_unit);
					return;
				}
				unitsData[playerY][playerX] = landing ? UnitType.SHIPDOWN : gamePlayer.overlay;
				playerX --;
				gamePlayer.x --;
				if (!onFoot && !landing) gameShip.x --;
				if (playerX < jump) {
					playerX = boardWidth-1;
					gamePlayer.x += boardWidth-jump;
				}
				tween.transitionX = -1;
				TweenFX.to(tween, 6, {transitionX: 0}, e => doFrameAnimationMove(), e => finalizeMove(4));
				prepareToMove(4);
			}

			break;
		case 5: // Center
			gamePlayer.selection = gamePlayer.selection ? 0 : 1;

			break;
		case 6: // Action
			_unit = getUnit(playerX, playerY);
			if (hasTutorial) {
				hasTutorial = '<br>Upgrade Ship at Castle ' + getSpan('&#9873', colors[1]) + '<br><br>Conquer Castles ';
				for (_unit = 2; _unit < colors.length; _unit++) {
					hasTutorial += " " + getSpan('&#9873', colors[_unit]);
				}
				prepareDialog("<u>Ahoy Corsair !</u>", hasTutorial + "<br>");
			} else
			if (gamePlayer.overlay == UnitType.CASTLE) {
				let _hp = !additionalParam && !isPlayerDamaged();
				let _amount = playerHealthMax - playerHealth + crewHealthMax - crewHealth;
				let secondMenu = shipHealth < shipHealthMax || shipLevel < 4;
				prepareDialog(
					_hp ? "Inn" : "Shipyard",
					_hp ? "Restores Hero and Crew HP, refreshes Ship movement and advances time by 1 day.<br>" : secondMenu ?
						shipHealth < shipHealthMax ? "<br>Repair Ship damage ("+(shipHealthMax-shipHealth)+")<br><br>" :
						shipLevel > 3 ? '<br>Ship maxed<br>' :
						`<br>Increase Ship HP by ${shipLevel == 2 ? 10 : 12} ?<br><br>` : '',

					_hp ? e => {
						if (spendGold(_amount)) return;
						healPlayer(_amount);
						backFromDialog();
						action(6, isPlayerDamaged());
					} : shipLevel < 4 ? upgradeShip : displayDialog,
					_hp ? "Rest " + goldIcon + _amount : shipLevel < 4 ? shipHealth < shipHealthMax ?
						"Repair " + goldIcon + (shipHealthMax - shipHealth) * 2 :
						"Deal " + goldIcon + shipPrices[shipLevel-1] : 0,

					_unit.rumors && !additionalParam ? () => action(6, 1) : secondMenu ? e => {
						_hp = (_unit.origin)*(crewHealthMax / 5 | 0);
						prepareDialog(
							"Tavern",
							'<br>Hear the latest rumors?<br><br>',
							() => displayRumors(_unit.rumors, _hp),
							"Ale " + goldIcon + _hp,
							displayDialog, "Exit"
						);
					} : displayDialog,
					secondMenu ? "Next" : "Exit"
				);
			} else
			if (gamePlayer.overlay == UnitType.SHRINE) {

				dungeon = _unit.dungeon;
				displayDungeon();

			} else
			if (gamePlayer.overlay == UnitType.TREE) {
				let _hp = healPlayer();
				if (!_hp) getUnit(playerX, playerY).apple = 0;
				updateActionButton();
			} else
			if (gamePlayer.overlay == UnitType.GOLD) {
				prepareDialog("Gold Ore", "Will you ?", quitGame, "Mine", displayDialog, "Exit");
			} else {
				// PASS
				if (inDialog) displayDialog();// hide the dialog
				//infoTab.innerHTML = `<br>${onFoot ? 'Dug, nothing? pass' : 'Fish, nothing? pass'}`;
				tween.transitionZ = 1;
				TweenFX.to(tween, 6, {transitionZ: 0}, e => doFrameAnimationMove(), e => finalizeMove(0));
				performEnemyMoves();
			}

			break;
		default: // Corners
			console.log("Default action:", direction);
			break;
	}
}