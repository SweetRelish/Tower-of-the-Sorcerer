"use strict";
(function() {	
	
	var DIM = 13;
	var TILE_SIZE = 32;

	var zj;
	var tower;
	
	var FLOOR = 1;
	var hp = 1000;
	var atk = 100;
	var def = 10;
	var gold = 0;
	var yellowKeyAmount = 100;
	var blueKeyAmount = 0;
	var redKeyAmount = 0;
	var timesOfPurchase = 0;
	//"flyer","noteBook","holyWater","amuletCoin","pickaxe",
	//						"cross","snowFlake","bomb","teleporter","floorUP","floorDown",
	//						"masterYellowKey","dragonSlayer"
	var hasFly = false;
	var hasNoteBook = false;
	var hasMonsterDex = false;
	var hasAmuletCoin = false;
	var hasCross = false;
	var hasTeleporter = false;
	var hasFloorUP = false;
	var hasFloorDown = false;
	var hasMasterYellowKey = false;
	var hasDragonSlayer = false;
	
	var lookUpMode = false;
	var storeMode = false;
	var oldHeadMode = false;
	var merchantMode = false;
	//var isShopped = {""};
	window.onload = function() {
		setTower();
		
		var ajax = new XMLHttpRequest();
		ajax.onload = getData;
		ajax.open("GET", "mota.json", true);
		ajax.send();
		
		function getData() {
			tower = JSON.parse(this.responseText);
			
			for(var i = 1; i < 50; i++) {
				var fakeWalls = tower[i].fakeWalls;
				var walls = tower[i].walls;				
				var items = tower[i].items;	
				var monsters = tower[i].monsters;
				
				floorBuilder(i, fakeWalls, walls, monsters, items);
			}		
			zj = create(11 * TILE_SIZE, 6 * TILE_SIZE, "zj_up", 1);
			setStore(19, 4);
			setStore(123, 12);
			setStore(140, 32);
			setStore(19, 46);
		}
		
		document.addEventListener("keydown", action);
		document.getElementById("enablebgm").onclick = enableBgm;
	};
	
	function action(event) {
		var movement = event.keyCode;
		// refresh
		if (includes(movement, [37,38,39,40])) {
			event.preventDefault();
		}
		var x = parseInt(zj.style.left);
		var y = parseInt(zj.style.top);
	
		var move = [37,38,39,40];
		var movePos = [y,x - TILE_SIZE,y - TILE_SIZE,x,y,x + TILE_SIZE,y + TILE_SIZE,x];
		var orientation = ["zj_left","zj_up","zj_right","zj_down"];
		
		
		if (storeMode) {
			var goldToSpend = 20 + timesOfPurchase * (timesOfPurchase + 1) * 10;
			if (includes(movement, [49,50,51])) {
				if (gold >= goldToSpend) {
					if (movement == 49) {
						hp += 100 + timesOfPurchase * 100;
						document.getElementById("status_hp").innerHTML = hp;
					} else if (movement == 50) {
						atk += Math.ceil(FLOOR / 10) * 2;
						document.getElementById("status_attack").innerHTML = atk;
					} else {
						def += Math.ceil(FLOOR / 10) * 4;
						document.getElementById("status_defense").innerHTML = def;
					}
					gold -= goldToSpend;
					document.getElementById("status_gold").innerHTML = gold;
					timesOfPurchase++;
					document.getElementById("store_ask").innerHTML =
					"Hi human, if you can give me " + 
					(20 + timesOfPurchase * (timesOfPurchase + 1) * 10) +
					" golds,I will make you become more powerful!";
					document.getElementById("increase_hp").innerHTML =
					"+ " + (100 + timesOfPurchase * 100) + " hp";
				}
			} else if (movement == 78) {
				storeMode = false;
				document.getElementById("store").style.zIndex = -3;
			}							
		} else if (oldHeadMode) {
			oldHeadMode = false;
			document.getElementById("oldhead").style.zIndex = -3;
			var thisOldHead = document.querySelector("#f" + FLOOR + " .oldHead");
			thisOldHead.parentNode.removeChild(thisOldHead);
			if (FLOOR == 3) {
				var pic = getASpecialItem("monsterDex");
				pic.onclick = showMonsterDex;
				hasMonsterDex = true;
			}
		} else if (merchantMode) {
			if (includes(movement, [89,78])) { // (y) or (n)
				merchantMode = false;
				document.getElementById("merchant").style.zIndex = -3;
			}		
		} else {		
			// fly up(70) or down(66)
			if (movement == 70) {
				zj.style.left = document.querySelector("#f" + FLOOR + " .upStairs.tile.items").style.left;
				zj.style.top = document.querySelector("#f" + FLOOR + " .upStairs.tile.items").style.top;
				x = parseInt(zj.style.left);
				y = parseInt(zj.style.top);
				var thisTile = document.getElementById(getID(y, x, FLOOR));
				checkFloorChange(thisTile);
			} else if (movement == 66) {
				zj.style.left = document.querySelector("#f" + FLOOR + " .downStairs.tile.items").style.left;
				zj.style.top = document.querySelector("#f" + FLOOR + " .downStairs.tile.items").style.top;
				x = parseInt(zj.style.left);
				y = parseInt(zj.style.top);
				var thisTile = document.getElementById(getID(y, x, FLOOR));
				checkFloorChange(thisTile);
			} else if (movement == 68) {
				if (hasMonsterDex) {
					if (lookUpMode) {		
						document.getElementById("monsterdex1").style.zIndex = -4;
						document.getElementById("monsterdex2").style.zIndex = -3;
					} else {
						document.getElementById("monsterdex1").style.zIndex = 4;
						document.getElementById("monsterdex2").style.zIndex = 3;
					}						
					showMonsterDex();
				}
			} else {
				// try to move
				for (var i = 0; i < move.length; i++) {
					if (movement == move[i]) {
						if (lookUpMode) {
							if (i == 0) {
								document.getElementById("monsterdex1").style.zIndex = 4;
								document.getElementById("monsterdex2").style.zIndex = -3;
							} else if (i == 2) {
								if (document.querySelector("#monsterdex2 .eachmonster")) {
									document.getElementById("monsterdex1").style.zIndex = -4;
									document.getElementById("monsterdex2").style.zIndex = 3;
								}
							}
						} else {
							zj.style.backgroundImage = getURL(orientation[i]);
							if (moveable(movePos[2 * i], movePos[2 * i + 1])) {
								zj.style.top = movePos[2 * i] + "px";
								zj.style.left = movePos[2 * i + 1] + "px";
								x = parseInt(zj.style.left);
								y = parseInt(zj.style.top);
								var thisTile = document.getElementById(getID(y, x, FLOOR));
								if (thisTile) {
									if (isMonster(thisTile)) {
										if (!canWin(thisTile)) {
											zj.style.top = movePos[0] + "px";
											zj.style.left = movePos[7] + "px";
										}							
									} else if (isDoor(thisTile)) {
										zj.style.top = movePos[0] + "px";
										zj.style.left = movePos[7] + "px";	
									} else if (isNpc(thisTile)) {
										zj.style.top = movePos[0] + "px";
										zj.style.left = movePos[7] + "px";	
									} else if (!isItem(thisTile)) {
										checkFloorChange(thisTile);
									}
								}
							}
						}
					}			
				}
			} 
		}
	}
	
	function enableBgm() {
		document.getElementById("bgm").autoplay = "autoplay";
		document.getElementById("bgm").muted = !this.firstChild.checked;
	}
	function showMonsterDex() {
		lookUpMode = !lookUpMode;
		var page1 = document.getElementById("monsterdex1");
		var page2 = document.getElementById("monsterdex2");
		
		
		page1.innerHTML = "";
		page2.innerHTML = "";
		
		var possibleList = document.querySelectorAll("#f" + FLOOR + " .monsters");
		var monsters = [];
		for (var i = 0; i < possibleList.length; i++) {
			if (!includes(possibleList[i].classList[0], monsters)) {
				monsters.push(possibleList[i].classList[0]);
			}
		}
		
		if (monsters.length < 7) {
			for (var i = 0; i < monsters.length; i++) {
				var bg = monsters[i];
				buildMonsterDex(page1, bg);		
			}
		} else {
			for (var i = 0; i < 6; i++) {
				var bg = monsters[i];
				buildMonsterDex(page1, bg);
			}
			for (var i = 6; i < monsters.length; i++) {
				var bg = monsters[i];
				buildMonsterDex(page2, bg);
			}
		}
		//page1.style.zIndex = (-1) * window.getComputedStyle(page1).zIndex;
		//document.addEventListener("keydown", function(){backToGame(page1, event)});	
	}
	
	function buildMonsterDex(pageNo, bg) {
		var infoList = ["monster_img","monster_name","monster_dmg",
						"monster_hp","monster_atk","monster_def","monster_gold"]; 
						
		var m_name = tower[51][bg].name;
		var m_hp = tower[51][bg].hp;
		var m_atk = tower[51][bg].atk;
		var m_def = tower[51][bg].def;
		var m_gold = tower[51][bg].gold;
		var m_statList = [m_hp,m_atk,m_def,m_gold];
		
		if(!document.getElementById("monsterstat_" + bg)) {
			var eachMonster = document.createElement("div");
			eachMonster.id = "monsterstat_" + bg;
			eachMonster.classList.add("eachmonster");
			pageNo.appendChild(eachMonster);
			
			for (var j = 0; j < infoList.length; j++) {
				var eachInfo = document.createElement("div");
				eachInfo.classList.add(infoList[j]);
				eachMonster.appendChild(eachInfo);
				if (j == 0) {
					var monsterImg = document.createElement("img");
					monsterImg.src = "icon/" + bg + ".png";
					eachInfo.appendChild(monsterImg);
				} else if (j == 1) {
					eachInfo.innerHTML = m_name;
				} else if (j == 2) {
					eachInfo.innerHTML = "damage:";
					if (atk <= m_def) {
						eachInfo.innerHTML += "???";
					} else if (m_atk < def) {
						eachInfo.innerHTML += 0;
					} else {
						eachInfo.innerHTML += Math.floor(m_hp / (atk - m_def)) * (m_atk - def);
					}	
				} else {
					eachInfo.innerHTML = infoList[j].substring(8) + ":" + m_statList[j - 3]; 
				}
			}
		}
	}
	function isMonster(thisTile) {
		return thisTile.classList.contains("monsters");
	}
	
	function canWin(thisTile) {
		var bg = thisTile.classList[0];
		var m_hp = tower[51][bg].hp;
		var m_atk = tower[51][bg].atk;
		var m_def = tower[51][bg].def;
		var m_gold = tower[51][bg].gold;
		var dmg = Math.floor(m_hp / (atk - m_def)) * (m_atk - def);
		
		if (atk < m_def || dmg >= hp) {
			return false;
		} else {
			hp -= dmg;
			gold += m_gold;
			document.getElementById("status_hp").innerHTML = hp;
			document.getElementById("status_gold").innerHTML = gold;
			thisTile.parentNode.removeChild(thisTile);
			// a message showing what you defeated and what you got
			
			return true;
		}
	}
	function monsterTrigger() {
		
	}
	
	function isDoor(thisTile) {
		var type = thisTile.classList[0];
		if (includes("Door", type)) {
			canOpen(type, thisTile);
			return true;
		}
		return false;
	}
	
	function canOpen(type, thisTile) {
		var thisType = type.substring(0, type.length - 4) + "keys_amount";
		var amount = document.getElementById(thisType).innerHTML;
		if (type == "yellowDoor") {
			if (yellowKeyAmount > 0) {
				yellowKeyAmount--;
				document.getElementById(thisType).innerHTML = yellowKeyAmount;
				thisTile.parentNode.removeChild(thisTile);
			}
		} else if (type == "blueDoor") {
			if (blueKeyAmount > 0) {
				blueKeyAmount--;
				document.getElementById(thisType).innerHTML = blueKeyAmount;
				thisTile.parentNode.removeChild(thisTile);
			}
		} else if (type == "redDoor") {
			if (redKeyAmount > 0) {
				redKeyAmount--;
				document.getElementById(thisType).innerHTML = redKeyAmount;
				thisTile.parentNode.removeChild(thisTile);
			}
		}		
	}
	
	function isItem(thisTile) {
		if (thisTile.classList.contains("items") && 
			!thisTile.classList.contains("upStairs") &&
			!thisTile.classList.contains("downStairs")) {
			if(!simpleItemsTrigger(thisTile)) {
				specialItemsTrigger(thisTile);
			}
			return true;
		}
		return false;	
	}
	
	function simpleItemsTrigger(thisTile) {
		var type = thisTile.classList[0];
		
		if (includes("Key", type) && type != "masterYellowKey") {
			if (type == "yellowKey") {
				yellowKeyAmount++;
				document.getElementById("yellowkeys_amount").innerHTML = yellowKeyAmount;		
			} else if (type == "blueKey") {
				blueKeyAmount++;
				document.getElementById("bluekeys_amount").innerHTML = blueKeyAmount;
			} else if (type == "redKey") {
				redKeyAmount++;
				document.getElementById("redkeys_amount").innerHTML = redKeyAmount;
			}
			thisTile.parentNode.removeChild(thisTile);
			return true;
		} else if (includes("Gem", type)) {
			if (type == "redGem") {
				atk += Math.ceil(FLOOR / 10);
				document.getElementById("status_attack").innerHTML = atk;
			} else if (type == "blueGem") {
				def += Math.ceil(FLOOR / 10);
				document.getElementById("status_defense").innerHTML = def;
			}
			thisTile.parentNode.removeChild(thisTile);
			return true;
		} else if (includes("HP", type)) {
			if (type == "redHP") {
				hp += Math.ceil(FLOOR / 10) * 50;
				document.getElementById("status_hp").innerHTML = hp;
			} else if (type == "blueHP") {
				hp += Math.ceil(FLOOR / 10) * 200;
				document.getElementById("status_hp").innerHTML = hp;
			}
			thisTile.parentNode.removeChild(thisTile);
			return true;
		} else if (includes("sword", type)) {
			if (type == "sword5") {
				atk += 100;
				document.getElementById("status_attack").innerHTML = atk;
			} else {
				atk += Math.ceil(FLOOR / 10) * 10;
				document.getElementById("status_attack").innerHTML = atk;
			}
					
			var weapon = document.getElementById("weapon_img");
			weapon.classList.add(type);
			var bg = window.getComputedStyle(weapon).backgroundImage;
			document.getElementById("weapon_name").innerHTML = bg.substring(53, bg.length - 5);
			thisTile.parentNode.removeChild(thisTile);
			return true;		
		} else if (includes("shield", type)) {
			if (type == "shieldscared") {
				def += 100;
				document.getElementById("status_defense").innerHTML = def;			
			} else {
				def += Math.ceil(FLOOR / 10) * 10;
				document.getElementById("status_defense").innerHTML = def;
			}
			
			var shield = document.getElementById("shield_img");				
			shield.classList.add(type);
			var bg = window.getComputedStyle(shield).backgroundImage;
			document.getElementById("shield_name").innerHTML = bg.substring(54, bg.length - 5);
			thisTile.parentNode.removeChild(thisTile);
			return true;
		}
		return false;
	}
	
	function specialItemsTrigger(thisTile) {
		var type = thisTile.classList[0];
		var specialItems = ["flyer","noteBook","holyWater","amuletCoin","pickaxe",
							"cross","snowFlake","bomb","teleporter","floorUP","floorDown",
							"masterYellowKey","dragonSlayer"];
		var pic = getASpecialItem(type);
		if (type == "flyer") {
			
		} else if (type == "noteBook") {
			pic.onclick = useNoteBook;
		} else if (type == "holyWater") {
			pic.onclick = useHolyWater;
		} else if (type == "amuletCoin") {
		
		} else if (type == "pickaxe") {
			pic.onclick = usePickaxe; // done
		} else if (type == "cross") {
			
		} else if (type == "snowFlake") {
			pic.onclick = useSnowFlake;
		} else if (type == "bomb") {
			pic.onclick = useBomb;
		} else if (type == "teleporter") {
			pic.onclick = useTeleporter;
		} else if (type == "floorUP") {
			pic.onclick = useFloorUP;
		} else if (type == "masterYellowKey") {
			pic.onclick = useMasterYellowKey;
		} else if (type == "dragonSlayer") {
			
		} else if (type == "floorDown") {
			pic.onclick = useFloorDown;
		}
		thisTile.parentNode.removeChild(thisTile);
	}
	
	function getASpecialItem(type) {
		var pic = document.createElement("img");
		pic.src = "icon/" + type + ".png";
		document.getElementById("rightpanel_items").appendChild(pic);
		return pic;
	}
	
	function isNpc(thisTile) {
		var npcs = ["storeMiddle","merchant","oldHead"];
		for (var i = 0; i < npcs.length; i++) {
			if (thisTile.classList.contains(npcs[i])) {
				visit(npcs[i]);
				return true;
			}
		}
		return false;
	}
	
	function visit(thisNpc) {
		if (thisNpc == "storeMiddle") {
			visitStore();
		} else if (thisNpc == "merchant") {
			visitMerchant();
		} else if (thisNpc == "oldHead") {
			visitOldHead();
		}
	}
	
	function visitStore() {
		storeMode = true;
		document.getElementById("store_ask").innerHTML = 
		"Hi human, if you can give me " +
		(20 + timesOfPurchase * (timesOfPurchase + 1) * 10) + 
		" golds, I will make you become more powerful!";
		document.getElementById("increase_hp").innerHTML = 
		"+ " + (100 + timesOfPurchase * 100) + " hp";
		document.getElementById("increase_atk").innerHTML = 
		"+ " + Math.ceil(FLOOR / 10) * 2 + " attack";
		document.getElementById("increase_def").innerHTML = 
		"+ " + Math.ceil(FLOOR / 10) * 4 + " defense";
		document.getElementById("store").style.zIndex = 3;
	}
	
	function visitMerchant() {
		merchantMode = true;
		var floor = "f" + FLOOR;
		document.getElementById("merchant_words").innerHTML = tower[53].floorOfMerchant[floor];
		document.getElementById("merchant").style.zIndex = 3;
	}
	
	function visitOldHead() {
		oldHeadMode = true;
		var floor = "f" + FLOOR;
		document.getElementById("oldhead_words").innerHTML = tower[53].floorOfOldHead[floor];
		document.getElementById("oldhead").style.zIndex = 3;
	}
	
	function useNoteBook() {
		
	}
	
	function useHolyWater() {
		hp += (atk + def) * 10;
		document.getElementById("status_hp").innerHTML = hp;
	}
	
	function usePickaxe() {
		var y = parseInt(zj.style.top);
		var x = parseInt(zj.style.left);
		var leftNeighbor = document.getElementById(getID(y, x - TILE_SIZE, FLOOR));
		var upNeighbor = document.getElementById(getID(y - TILE_SIZE, x, FLOOR));
		var rightNeighbor = document.getElementById(getID(y, x + TILE_SIZE, FLOOR));
		var downNeighbor = document.getElementById(getID(y + TILE_SIZE, x, FLOOR));
		var neighbors = [leftNeighbor,upNeighbor,rightNeighbor,downNeighbor];
		for (var i = 0; i < neighbors.length; i++) {
			if (neighbors[i] && neighbors[i].classList.contains("brownWall") && 
				neighbors[i].parentNode.style.zIndex == 2) {
				neighbors[i].parentNode.removeChild(neighbors[i]);
			}
		}
		this.parentNode.removeChild(this);
	}
	
	function useMonsterDex() {
		
	}
	
	function useSnowFlake() {
		
	}
	
	function useBomb() {
		
	}
	
	function useTeleporter() {
		
	}
	
	function useFloorUP() {
		
	}
	
	function useMasterYellowKey() {
		
	}
	
	function useFloorDown() {
		
	}
	
	function checkFloorChange(thisTile) {
		if (thisTile.classList.contains("upStairs")) {
			if (FLOOR != 43) {
				floorChange("downStairs", 1);
			} else if(FLOOR == 43) {
				floorChange("downStairs", 2);
			}		
		} else if (thisTile.classList.contains("downStairs")) {
			if (FLOOR != 45) {
				floorChange("upStairs", -1);
			} else if(FLOOR == 45) {
				floorChange("upStairs", -2);
			}
		}
	}
	
	function floorChange(stairs, deltaf) {
		var thisF = document.getElementById("f" + FLOOR);
		thisF.style.zIndex = 0;		
		
		var thisFElements = document.querySelectorAll("#f" + FLOOR + " .tile");
		for (var i = 0; i < thisFElements.length; i++) {
			thisFElements[i].classList.remove("tile");
			thisFElements[i].classList.add("invisibletile");
		}
		thisF.removeChild(zj);
		
		FLOOR += deltaf;
		document.getElementById("leftpanel_floornumber").innerHTML = FLOOR + "F";
		
		var nextF = document.getElementById("f" + FLOOR);
		nextF.style.zIndex = 2;	
		
		var thisStair = document.querySelector("#f" + FLOOR + " ." + stairs + ".items.invisibletile");
		var stair_x = parseInt(thisStair.style.left);
		var stair_y = parseInt(thisStair.style.top);
		zj = create(stair_y, stair_x, "zj_down", FLOOR + "");
		
		var nextFElements = document.querySelectorAll("#f" + FLOOR + " .invisibletile");
		for (var i = 0; i < nextFElements.length; i++) {
			nextFElements[i].classList.remove("invisibletile");
			nextFElements[i].classList.add("tile");
		}
		
		
		
	}
	
	function moveable(y, x) {
		var tile = document.getElementById(getID(y, x, FLOOR)) || 
					document.getElementById(getID(y, x, "border"));
		if (tile) {
			if (tile.classList.contains("walls")) {
				if (tile.classList.contains("fakeBrownWall")) {
					var tile = document.getElementById(getID(y, x, FLOOR));
					tile.parentNode.removeChild(tile);
				}
				return false;	
			} else {
				var specialLandForm = ["magma","prisonDoor","water","specialDoor",
										"storeLeft","storeRight"];
				for (var i = 0; i < specialLandForm.length; i++) {
					if (tile.classList.contains(specialLandForm[i])) {
						return false;
					}
				}
			}
		}
		return true;	
	}
	
	function getID(y, x, f) {
		return y + "_" + x + "_" + f;
	}
	
	function getURL(bg) {
		return "url(http://www.andrew-yq.com/shift90/lab42/icon/" + bg + ".png)";
	}
		
	function includes(i, items) {
		if (items.indexOf(i) == -1) {
			return false;
		} else {
			return true;
		}
	}
	
	// set road and walls
	function create(y, x, bg, f) {
		var tile = document.createElement("div");
		document.getElementById("f" + f).appendChild(tile);
		tile.style.top = y + "px";
		tile.style.left = x + "px";
		if (bg != "road") {
			tile.id = getID(y, x, f);
		}
		tile.classList.add(bg);
		if (f == "1" || f == "border") {
			tile.classList.add("tile");
		} else {
			tile.classList.add("invisibletile");
		}
		
		return tile;
	}
	
	// set pickable items or monsters on road
	function setItems(y, x, bg, description, f) {
		var tile = create(y, x, bg, f);
		tile.classList.add(description);	
		return tile;
	}
	
	function setTower() {
		createGameBoard("border");
		var tile;
		for(var i = 0; i < DIM * DIM; i++) {
			var y = Math.floor(i / DIM) * TILE_SIZE;
			var x = i % DIM * TILE_SIZE;
			if (i < 13 || i % 13 == 0 || i % 13 == 12 || i > 156) {
				
				tile = create(y, x, "brownWall", "border");
				tile.classList.add("walls");
			} else {
				tile = create(y, x, "road", "border");
				tile.innerHTML = i;
			}		
		}
	}
	
	function setStore(position, f) {
		var y = Math.floor(position / DIM) * TILE_SIZE;
		var x = position % DIM * TILE_SIZE;
		var storeMiddle = create(y, x, "storeMiddle", f);
		var storeLeft = create(y, x - TILE_SIZE, "storeLeft", f);
		var storeRight = create(y, x + TILE_SIZE, "storeRight", f);
		storeMiddle.classList.add("store");
		storeLeft.classList.add("store");
		storeRight.classList.add("store");
	}
		
	function floorBuilder(f, fakeWalls, walls, monsters, items) {
		createGameBoard(f);

		if (fakeWalls) {
			putElements(fakeWalls, "walls", f);
		}
		putElements(walls, "walls", f);
		for (var i = 0; i < items.length; i++) {
			putElements(items[i], "items", f);
		}
		for (var i = 0; i < monsters.length; i++) {
			putElements(monsters[i], "monsters", f);
		}
			
	}
	
	function createGameBoard(f) {
		var gameBoard = document.createElement("div");
		gameBoard.id = "f" + f;
		gameBoard.classList.add("zone");
		document.getElementById("mainzone").appendChild(gameBoard);
		if (f == 1) {
			gameBoard.style.zIndex = 2;			
		} else if (f == "border") {
			gameBoard.style.zIndex = 1;
		} else {
			gameBoard.style.zIndex = 0;
		}
		if (f == "50") {	
			gameBoard.style.height = 416 + "px";
		}	
	}
	
	function putElements(element, description, f) {
		for (var i = 1; i < element.length; i++) {
			var y = Math.floor(element[i] / DIM) * TILE_SIZE;
			var x = element[i] % DIM * TILE_SIZE;			
			setItems(y, x, element[0], description, f);
		}		
	}
	
	})();
