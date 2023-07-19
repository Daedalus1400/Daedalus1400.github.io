function LimitSlope(element) {
	if (element.value > 4) {
		element.value = 4;
	} else if (element.value < 1) {
		element.value = 1;
	}
}

// Fore options UI

function ForeStyleChanged(value) {
	if (value == "sloped") {
		document.getElementById('foreSlopeInput').disabled = false;
	} else {
		document.getElementById('foreSlopeInput').disabled = true;
	}
}

// Aft options UI

function AftStyleChanged(value) {
	if (value == "sloped") {
		document.getElementById('aftSlopeInput').disabled = false;
	} else {
		document.getElementById('aftSlopeInput').disabled = true;
	}
}