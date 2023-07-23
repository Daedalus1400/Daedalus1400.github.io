function LimitSlope(element) {
	if (element.value > 4) {
		element.value = 4;
	} else if (element.value < 1) {
		element.value = 1;
	}
}

// Bow options UI

function BowStyleChanged(value) {
	if (value == "sloped") {
		document.getElementById('bowSlopeInput').disabled = false;
	} else {
		document.getElementById('bowSlopeInput').disabled = true;
	}
}

// Stern options UI

function SternStyleChanged(value) {
	if (value == "sloped") {
		document.getElementById('sternSlopeInput').disabled = false;
	} else {
		document.getElementById('sternSlopeInput').disabled = true;
	}
}