
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
	var vehicleArray = GenerateHull();
	BeamifyArray(vehicleArray, "z");
	var blueprint = JSON.parse(JSON.stringify(template));
	GenerateBlueprintFromArray(vehicleArray, blueprint);
	SaveBlueprint(blueprint, fileName);
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
		if (dictionary != null) {
			document.getElementById("generateButton").removeAttribute("disabled");
		}
	}
}

function LoadDictionaryCallback(dictionaryJSON) {
	if (dictionaryJSON == null) {
		console.log("Error loading block dictionary");
	} else {
		dictionary = dictionaryJSON.blockDictionary;
		if (template != null) {
			document.getElementById("generateButton").removeAttribute("disabled");
		}
	}
}

function GenerateHull() {
	var vehicle = [[[]]];
	var length = document.getElementById("lengthInput").value;
	var beam = document.getElementById("beamInput").value;

	for (let z = 0; z < length; z++) {
		for (let x = 0; x < beam / 2; x++) {
			PlaceBlockInArray(vehicle, [x, 0, z], "lightAlloy");
			if (x > 0) {
				PlaceBlockInArray(vehicle, [-x, 0, z], "lightAlloy");
			}
		}
	}

	var bowShape = document.getElementById("bowStyleSelector").value;
	if (bowShape == "sloped") {
		var bowSlope = document.getElementById("bowSlopeInput").value;
		var bowLength = bowSlope * beam / 2;
		for (let z = length; z < length + bowLength; z++) {
			var slopeStop = (bowLength - (z - length)) / bowSlope;
			for (let x = 0; x < slopeStop; x++) {
				PlaceBlockInArray(vehicle, [x, 0, z], "lightAlloy");
				if (x > 0) {
					PlaceBlockInArray(vehicle, [-x, 0, z], "lightAlloy");
				}
			}
		}
	} 

	var sternShape = document.getElementById("sternStyleSelector").value;
	if (sternShape == "sloped") {
		var sternSlope = document.getElementById("sternSlopeInput").value;
		var sternLength = sternSlope * beam / 2; // Magnitude
		for (let z = -1; z > -sternLength; z--) {
			var slopeStop = (sternLength + z) / sternSlope;
			for (let x = 0; x < slopeStop; x++) {
				PlaceBlockInArray(vehicle, [x, 0, z], "lightAlloy");
				if (x > 0) {
					PlaceBlockInArray(vehicle, [-x, 0, z], "lightAlloy");
				}
			}
		}
	}

	FillOutArray(vehicle);

	return vehicle;
}

function FillOutArray(array) {
	for (let x = minX; x <= maxX; x++) {
		if (array[x] == null) {
			array[x] = new Array();
		}

		for (let y = minY; y <= maxY; y++) {
			if (array[x][y] == null) {
				array[x][y] = new Array();
			}

			for (let z = minZ; z <= maxZ; z++) {
				if (array[x][y][z] == null) {
					array[x][y][z] = 0;
				}
			}
		}
	}
}

function BeamifyArray(array, axis = "z") {

	if (axis == "x") {
		for (let z = minZ; z <= maxZ; z++) {
			for (let y = minY; y <= maxY; y++) {
	
				let position = [0, y, z];
				let material = null;
	
				for (let x = minX; x <= maxX; x++) {
	
					let value = array[x][y][z];
	
					if (value != -1 && value != 0 && material == null) {

						position[0] = x;
						material = value.mat;

					} else if (material != null) {

						let stopValue = null;
						let size = x - position[0];

						if (value == 0) {
							stopValue = x - 1;
							
						} else if (value.mat != material) {
							stopValue = x - 1;
							x--;

						} else if (size == 3) {
							size = 4;
							stopValue = x;

						} else if (x == maxX) {
							size = size + 1;
							stopValue = x;
						}

						if (stopValue != null) {
							PlaceBlockInArray(array, position, material, "beam1x" + String(size), 1);

							for (let i = position[0] + 1; i <= stopValue; i++) {
								PlaceBlockInArray(array, [i, position[1], position[2]], -1);
							}
							material = null;
						}
					}
				}
			}
		}
	} else if (axis == "y") {
		for (let x = minX; x <= maxX; x++) {
			for (let z = minZ; z <= maxZ; z++) {
	
				let position = [x, 0, z];
				let material = null;
	
				for (let y = minY; y <= maxY; y++) {
	
					let value = array[x][y][z];
	
					if (value != -1 && value != 0 && material == null) {

						position[1] = y;
						material = value.mat;

					} else if (material != null) {

						let stopValue = null;
						let size = y - position[1];

						if (value == 0) {
							stopValue = y - 1;
							
						} else if (value.mat != material) {
							stopValue = y - 1;
							y--;
							
						} else if (size == 3) {
							size = 4;
							stopValue = y;

						} else if (y == maxY) {
							size = size + 1;
							stopValue = y;
						}

						if (stopValue != null) {
							PlaceBlockInArray(array, position, material, "beam1x" + String(size), 10);

							for (let i = position[1] + 1; i <= stopValue; i++) {
								PlaceBlockInArray(array, [position[0], i, position[2]], -1);
							}
							material = null;
						}
					}
				}
			}
		}
	} else if (axis == "z") {
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
	
				let position = [x, y, 0];
				let material = null;
	
				for (let z = minZ; z <= maxZ; z++) {
	
					let value = array[x][y][z];
	
					if (value != -1 && value != 0 && material == null) {

						position[2] = z;
						material = value.mat;

					} else if (material != null) {

						let stopValue = null;
						let size = z - position[2];

						if (value == 0) {
							stopValue = z - 1;
							
						} else if (value.mat != material) {
							stopValue = z - 1;
							z--;

						} else if (size == 3) {
							size = 4;
							stopValue = z;

						} else if (z == maxZ) {
							size = size + 1;
							stopValue = z;
						}

						if (stopValue != null) {
							PlaceBlockInArray(array, position, material, "beam1x" + String(size));

							for (let i = position[2] + 1; i <= stopValue; i++) {
								PlaceBlockInArray(array, [position[0], position[1], i], -1);
							}
							material = null;
						}
					}
				}
			}
		}
	}
}

function GenerateBlueprintFromArray(array, blueprint) {
	for (let x = minX; x <= maxX; x++) {
		for (let y = minY; y <= maxY; y++) {
			for (let z = minZ; z <= maxZ; z++) {

				let value = array[x][y][z];

				if (value != -1 && value != 0) {
					let key = dictionary[value.mat][value.shape].key;
					let hash = dictionary[value.mat][value.shape].hash;

					if (blueprint.ItemDictionary[key] == null) {
						blueprint.ItemDictionary[key] = hash;
					}
					PlaceBlockInBlueprint(blueprint, [x, y, z], key, value.rot);
				}
			}
		}
	}
}

function SaveBlueprint(blueprintJSON, fileName = "unnamed") {
	SetBlueprintExtents(blueprintJSON);
	blueprintJSON.Name = fileName;
	blueprintJSON.Blueprint.blueprintName = fileName;
	blueprintJSON.ItemDictionary[dictionary.metal.beam1x1.key] = dictionary.metal.beam1x1.hash;
	blueprintJSON.ItemDictionary[dictionary.lightAlloy.beam1x1.key] = dictionary.lightAlloy.beam1x1.hash;
	blueprintJSON.ItemDictionary[dictionary.heavyArmor.beam1x1.key] = dictionary.heavyArmor.beam1x1.hash;
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

function PlaceBlockInArray(array, position, material, shape = "beam1x1", rotation = 0) {

	if (array[position[0]] == null) {

		array[position[0]] = new Array();
		array[position[0]][position[1]] = new Array();

	} else if (array[position[0]][position[1]] == null) {

		array[position[0]][position[1]] = new Array();

	}

	if (material == -1 || material == 0) {
		array[position[0]][position[1]][position[2]] = material;
	} else {
		array[position[0]][position[1]][position[2]] = {"mat":material, "shape":shape, "rot":rotation};
	}

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

function PlaceBlockInBlueprint(blueprint, position, blockType, rotation = 0, color = 0) {
	blueprint.Blueprint.BLP.push(String(position[0] + "," + position[1] + "," + position[2]));
	blueprint.Blueprint.BCI.push(color);
	blueprint.Blueprint.BLR.push(rotation);
	blueprint.Blueprint.BlockIds.push(Number(blockType));
	blueprint.Blueprint.AliveCount += 1;
	blueprint.Blueprint.BlockCount += 1;
	blueprint.Blueprint.TotalBlockCount += 1;
	blueprint.SavedTotalBlockCount += 1;
}

function SetBlueprintExtents(blueprint) {
	
	blueprint.Blueprint.MaxCords = String(maxX + "," + maxY + "," + maxZ);
	blueprint.Blueprint.MinCords = String(minX + "," + minY + "," + minZ);
	
}