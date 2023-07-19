
var template = null;
var dictionary = null;
var maxX = 0;
var minX = 0;
var maxY = 0;
var minY = 0;
var maxZ = 0;
var minZ = 0;

LoadTemplateAndDictionary();

function GenerateBlueprint() {
	if (template == null) {
		throw new Error("Blueprint template not loaded.");
		return;
	} else if (dictionary == null) {
		throw new Error("Block dictionary not loaded.");
		return;
	}
	maxX = 0;
	minX = 0;
	maxY = 0;
	minY = 0;
	maxZ = 0;
	minZ = 0;
	var fileName = document.getElementById("fileNameInput").value;
	GenerateTestVehicle(fileName);
}

function LoadTemplateAndDictionary() {
	LoadJSONFile("/json_data/vehicle-template.json", LoadTemplateCallback)
	LoadJSONFile("/json_data/block-dictionary.json", LoadDictionaryCallback)
}

async function LoadJSONFile(filePath, callback) {
	const response = await fetch(filePath);
	const data = await response.json();
	callback(data);
}

function LoadTemplateCallback(templateJSON) {
	if (templateJSON == null) {
		console.log("Error loading blueprint template");
	} else {
		template = templateJSON;
	}
}

function LoadDictionaryCallback(dictionaryJSON) {
	if (dictionaryJSON == null) {
		console.log("Error loading block dictionary");
	} else {
		dictionary = dictionaryJSON.blockDictionary;
	}
}

function GenerateTestVehicle(fileName = "unnamed") {
	var vehicle = JSON.parse(JSON.stringify(template));
	vehicle.Name = fileName;
	vehicle.Blueprint.blueprintName = fileName;
	vehicle.ItemDictionary[dictionary.metal.beam1x1.key] = dictionary.metal.beam1x1.hash;
	vehicle.ItemDictionary[dictionary.lightAlloy.beam1x1.key] = dictionary.lightAlloy.beam1x1.hash;
	vehicle.ItemDictionary[dictionary.heavyArmor.beam1x1.key] = dictionary.heavyArmor.beam1x1.hash;
	var length = document.getElementById("lengthInput").value;
	var beam = document.getElementById("beamInput").value;

	for (let z = 0; z < length; z++) {
		for (let x = 0; x < beam / 2; x++) {
			PlaceBlock(vehicle, [x, 0, z], dictionary.lightAlloy.beam1x1.key);
			if (x > 0) {
				PlaceBlock(vehicle, [-x, 0, z], dictionary.lightAlloy.beam1x1.key);
			}
		}
	}

	var foreShape = document.getElementById("foreStyleSelector").value;
	if (foreShape == "sloped") {
		var foreSlope = document.getElementById("foreSlopeInput").value;
		var foreLength = foreSlope * beam / 2;
		for (let z = length; z < length + foreLength; z++) {
			var slopeStop = (foreLength - (z - length)) / foreSlope;
			for (let x = 0; x < slopeStop; x++) {
				PlaceBlock(vehicle, [x, 0, z], dictionary.lightAlloy.beam1x1.key);
				if (x > 0) {
					PlaceBlock(vehicle, [-x, 0, z], dictionary.lightAlloy.beam1x1.key);
				}
			}
		}
	} 

	var aftShape = document.getElementById("aftStyleSelector").value;
	if (aftShape == "sloped") {
		var aftSlope = document.getElementById("aftSlopeInput").value;
		var aftLength = aftSlope * beam / 2; // Magnitude
		for (let z = -1; z > -aftLength; z--) {
			var slopeStop = (aftLength + z) / aftSlope;
			for (let x = 0; x < slopeStop; x++) {
				PlaceBlock(vehicle, [x, 0, z], dictionary.lightAlloy.beam1x1.key);
				if (x > 0) {
					PlaceBlock(vehicle, [-x, 0, z], dictionary.lightAlloy.beam1x1.key);
				}
			}
		}
	} 

	SetBlueprintExtents(vehicle);
	SaveBlueprint(vehicle);
}

function SaveBlueprint(blueprintJSON) {
	var file = new Blob([JSON.stringify(blueprintJSON)], {type: "application/json",})
	var fileName = String(blueprintJSON.Name + ".blueprint")
	if (window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(file, fileName);
	} else {
		var a = document.createElement("a"),
			url = URL.createObjectURL(file);
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		setTimeout(function() {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0)
	}
}

function PlaceBlock(blueprint, position, blockType, rotation = 0, color = 0) {
	blueprint.Blueprint.BLP.push(String(position[0] + "," + position[1] + "," + position[2]));
	blueprint.Blueprint.BCI.push(color);
	blueprint.Blueprint.BLR.push(rotation);
	blueprint.Blueprint.BlockIds.push(Number(blockType));
	blueprint.Blueprint.AliveCount += 1;
	blueprint.Blueprint.BlockCount += 1;
	blueprint.Blueprint.TotalBlockCount += 1;
	blueprint.SavedTotalBlockCount += 1;

	if (position[0] < minX) {
		minX = position[0];
	} else if (position[0] > maxX) {
		maxX = position[0];
	}

	if (position[1] < minY) {
		minY = position[1];
	} else if (position[1] > maxY) {
		maxY = position[1];
	}

	if (position[2] < minZ) {
		minZ = position[2];
	} else if (position[2] > maxZ) {
		maxZ = position[2];
	}
}

function SetBlueprintExtents(blueprint) {
	
	blueprint.Blueprint.MaxCords = String(maxX + "," + maxY + "," + maxZ);
	blueprint.Blueprint.MinCords = String(minX + "," + minY + "," + minZ);
	
}
