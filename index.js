
var template = null;
var dictionary = null;
var maxX = 0;
var minX = 0;
var maxY = 0;
var minY = 0;
var maxZ = 0;
var minZ = 0;

LoadJSONFile("/json_data/vehicle-template.json", LoadTemplateCallback)

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
		LoadJSONFile("/json_data/block-dictionary.json", LoadDictionaryCallback);
	}
}

function LoadDictionaryCallback(dictionaryJSON) {
	if (dictionaryJSON == null) {
		console.log("Error loading block dictionary");
	} else {
		dictionary = dictionaryJSON.blockDictionary;
		GenerateTestVehicle();
	}
}

function GenerateTestVehicle() {
	var vehicle = JSON.parse(JSON.stringify(template));
	vehicle.ItemDictionary[dictionary.metal.beam1x1.key] = dictionary.metal.beam1x1.hash;
	vehicle.ItemDictionary[dictionary.lightAlloy.beam1x1.key] = dictionary.lightAlloy.beam1x1.hash;
	vehicle.ItemDictionary[dictionary.heavyArmor.beam1x1.key] = dictionary.heavyArmor.beam1x1.hash;
	PlaceBlock(vehicle, [0,0,0], dictionary.metal.beam1x1.key);
	PlaceBlock(vehicle, [1,0,0], dictionary.metal.beam1x1.key);
	PlaceBlock(vehicle, [2,0,0], dictionary.metal.beam1x1.key);
	PlaceBlock(vehicle, [0,1,0], dictionary.metal.beam1x1.key);
	PlaceBlock(vehicle, [1,1,0], dictionary.metal.beam1x1.key);
	PlaceBlock(vehicle, [2,1,0], dictionary.metal.beam1x1.key);
	SetBlueprintExtents(vehicle);
	console.log(JSON.stringify(vehicle));
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