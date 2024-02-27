document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('buttJointCanvas');
    const ctx = canvas.getContext('2d');
    const dragButton = document.getElementById('dragButton');

    // Create display elements
    const thicknessDisplay = document.createElement('div');
    thicknessDisplay.id = 'thicknessDisplay'; // Assign an ID for later reference
    thicknessDisplay.className = 'thickness-info'; // Assign a class for styling
    thicknessDisplay.textContent = 'Thickness: 0.00'; // Set initial text content
    
    // Assuming you have a container with a class 'column-container' for the left column
    const leftColumnContainer = document.querySelector('.column-container');
    
    // Insert the thicknessDisplay div at the top of the left column
    leftColumnContainer.prepend(thicknessDisplay);
    const screwSizeDisplay = document.createElement('div');
    const stopCollarDisplay = document.createElement('div');
    const jigSettingDisplay = document.createElement('div');

    // Set class name for styling (if needed)
    [thicknessDisplay, screwSizeDisplay, stopCollarDisplay, jigSettingDisplay].forEach(el => {
        el.className = 'display-element';
    });

    // Identify the drill bit section
    const drillBitSection = document.getElementById('drillBitSection');


    let actualThickness = 150; // Initial thickness in hundredths of an inch

    const settingsMapping = [
        { 
            thickness: 0.5, 
            screwSize: 1, 
            stopCollar: 0.5, 
            jigSetting: 0.5, 
            collarPosition: 24, 
            jigSvg: 'images/JS.5.svg',
            screwSvg: 'images/SS1.svg' // Added Screw Size SVG path
        },
        { 
            thickness: 0.75, 
            screwSize: 1.25, 
            stopCollar: 0.75, 
            jigSetting: 0.75, 
            collarPosition: 45.5, 
            jigSvg: 'images/JS.75.svg',
            screwSvg: 'images/SS1.25.svg' // Added Screw Size SVG path
        },
        { 
            thickness: 0.875, 
            screwSize: 1.5, 
            stopCollar: 0.75, 
            jigSetting: 0.75, 
            collarPosition: 45.5, 
            jigSvg: 'images/JS.75.svg',
            screwSvg: 'images/SS1.5.svg' // Added Screw Size SVG path
        },
        { 
            thickness: 1, 
            screwSize: 1.5, 
            stopCollar: 0.75, 
            jigSetting: 0.75, 
            collarPosition: 45.5, 
            jigSvg: 'images/JS.75.svg',
            screwSvg: 'images/SS1.5.svg' // Added Screw Size SVG path
        },
        { 
            thickness: 1.25, 
            screwSize: 2, 
            stopCollar: 1.5, 
            jigSetting: 1.5, 
            collarPosition: 71.5, 
            jigSvg: 'images/JS1.5.svg',
            screwSvg: 'images/SS2.svg' // Added Screw Size SVG path
        },
        { 
            thickness: 1.5, 
            screwSize: 2.5, 
            stopCollar: 1.5, 
            jigSetting: 1.5, 
            collarPosition: 71.5, 
            jigSvg: 'images/JS1.5.svg',
            screwSvg: 'images/SS2.5.svg' // Added Screw Size SVG path
        }
    ];
    
    

    const woodImageHor = new Image();
    woodImageHor.src = 'images/woodgrain.png';
    const woodImageVert = new Image();
    woodImageVert.src = 'images/woodgrainvert.png';

    let scaleImage = new Image(155, 30); // Size of the scale image
    scaleImage.src = 'images/Scale.svg'; // Path to the scale image

    const screwImages = [
        { minThickness: 0.5, maxThickness: 0.75, src: 'images/screw.5.png', width: 234, height: 46, offsetX: 73 },
        { minThickness: 0.75, maxThickness: 0.875, src: 'images/screw.75.png', width: 299, height: 63, offsetX: 82 },
        { minThickness: 0.875, maxThickness: 1.25, src: 'images/screw.875.png', width: 321, height: 70, offsetX: 75 },
        { minThickness: 1.25, maxThickness: 1.5, src: 'images/screw1.25.png', width: 437, height: 104, offsetX: 125 },
        { minThickness: 1.5, maxThickness: Infinity, src: 'images/screw1.5.png', width: 500, height: 114, offsetX: 100 }
    ].map(screw => ({
        ...screw,
        image: Object.assign(new Image(), { src: screw.src })
    }));

    let imagesLoaded = 0;
    let totalImagesToLoad = 2 + screwImages.length + 1; // Including the scale image
    [woodImageHor, woodImageVert, scaleImage, ...screwImages.map(s => s.image)].forEach(img => {
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImagesToLoad) {
                drawButtJoint(actualThickness);
            }
        };
    });

    function adjustCanvasWidth() {
        const viewportWidth = window.innerWidth;
        if (viewportWidth > 600) {
            canvas.style.width = `450px`;
        } else {
            canvas.style.width = '100%';
        }
        canvas.width = canvas.offsetWidth; // Ensure the drawing buffer matches the displayed size
        drawButtJoint(actualThickness); // Redraw the canvas contents after resizing
    }

    window.addEventListener('resize', adjustCanvasWidth);
    adjustCanvasWidth(); // Initial adjustment

    function drawButtJoint(thickness) {
        actualThickness = thickness;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = ctx.createPattern(woodImageVert, 'repeat');
        ctx.fillRect(2, 0, thickness, canvas.height);

        ctx.fillStyle = ctx.createPattern(woodImageHor, 'repeat');
        ctx.fillRect(thickness, 0, canvas.width - thickness, thickness);

        let scaleImageXPosition = 0; // 2 pixels to the left
        let scaleImageYPosition = canvas.height - scaleImage.height; // At the bottom of the canvas
        ctx.drawImage(scaleImage, scaleImageXPosition, scaleImageYPosition, scaleImage.width, scaleImage.height);

        const thicknessInInches = thickness / 100;
        const screw = screwImages.find(s => thicknessInInches >= s.minThickness && thicknessInInches < s.maxThickness);
        if (screw) {
            ctx.drawImage(screw.image, thickness - screw.width / 2 + screw.offsetX, 0, screw.width, screw.height);
        }

        updateDragButtonPosition();
        updateDisplays();
        updateRecommendedProductImage();
}

    function updateDragButtonPosition() {
        const canvasRect = canvas.getBoundingClientRect();
        dragButton.style.top = `${canvasRect.top + window.scrollY + actualThickness - (dragButton.offsetHeight / 2)}px`;
        dragButton.style.left = `${canvasRect.right - dragButton.offsetWidth - 20}px`; // Position on the right
    }

    
    function updateRecommendedProductImage() {
        // Extract the screw size directly from the screwSizeDisplay text content
        const screwSizeMatch = screwSizeDisplay.textContent.match(/\d+(\.\d+)?/);
        const screwSize = screwSizeMatch ? screwSizeMatch[0] : '';
    
        const woodType = document.getElementById('wood-type-input').checked ? 'Hardwood' : 'Softwood';
        const indoorOutdoor = document.getElementById('indoor-outdoor-input').checked ? 'Outdoor' : 'Indoor';
    
        // Construct the image filename based on the selections
        let imageName = `${screwSize}${woodType.charAt(0)}${indoorOutdoor.charAt(0)}.png`; // Example: "1.5HO.png" for 1.5", Hardwood, Outdoor
        let imagePath = `images/${imageName}`; // Adjust the path based on your directory structure
    
        // Update the image source
        document.getElementById('recommendedProductImage').src = imagePath;
    }
    
    
    
    
    document.getElementById('wood-type-input').addEventListener('change', updateRecommendedProductImage);
    document.getElementById('indoor-outdoor-input').addEventListener('change', updateRecommendedProductImage);

    function updateDisplays() {
        const thicknessInInches = actualThickness / 100;
        thicknessDisplay.textContent = thicknessInInches.toFixed(2); // Display just the number with two decimal places
    
        let closestSettings = settingsMapping[0];
        for (let i = 0; i < settingsMapping.length; i++) {
            if (thicknessInInches >= settingsMapping[i].thickness) {
                closestSettings = settingsMapping[i];
            } else {
                break;
            }
        }
    
        // Update text displays (if you have them for debugging or additional info)
        screwSizeDisplay.textContent = `Screw Size: ${closestSettings.screwSize}"`;
        stopCollarDisplay.textContent = `Stop Collar: ${closestSettings.stopCollar}"`;
        jigSettingDisplay.textContent = `Jig Setting: ${closestSettings.jigSetting}"`;
    
        // Update the collar position (existing logic)
        const collarImage = document.getElementById('collarImage');
        const drillBitImageContainer = document.getElementById('drillBitImageContainer');
        const collarPositionPercentage = closestSettings.collarPosition;
        const collarTopPosition = (drillBitImageContainer.offsetHeight * collarPositionPercentage) / 100;
        collarImage.style.top = `${collarTopPosition}px`;
    
        // Update the jig setting SVG based on the current settings (existing logic)
        const jigSettingImage = document.getElementById('jigSettingImage');
        jigSettingImage.src = closestSettings.jigSvg;
    
        // Update the screw size SVG based on the current settings (new logic)
        const screwSizeImage = document.getElementById('screwSizeImage');
        screwSizeImage.src = `images/SS${closestSettings.screwSize}.svg`; // Construct the path based on the screw size
    }
    
    
    
    
    function updateCanvasCalculations() {
        // Assuming 'actualThickness', 'screwSize', 'stopCollar', 'jigSetting' are calculated here
    
        // Update the display elements with new values
        document.getElementById('thicknessValue').textContent = decimalToFrac(actualThickness) + '"';
        document.getElementById('screwSizeValue').textContent = decimalToFrac(screwSize) + '"';
        document.getElementById('stopCollarValue').textContent = decimalToFrac(stopCollar) + '"';
        document.getElementById('jigSettingValue').textContent = decimalToFrac(jigSetting) + '"';
    }
    
    function startDrag(e) {
        e.preventDefault();
        let startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        function onMouseMove(e) {
            let newY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            let diffY = newY - startY;
            startY = newY;
            let newThickness = Math.max(50, Math.min(actualThickness + diffY, 150));
            drawButtJoint(newThickness);
        }

        function endDrag() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', endDrag);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', endDrag);
    }

    dragButton.addEventListener('mousedown', startDrag);
    dragButton.addEventListener('touchstart', startDrag);
});
// Existing JavaScript logic above

// JavaScript for Wood Type Switch
document.getElementById('wood-type-input').addEventListener('change', function() {
    if (this.checked) {
        console.log('HARDWOOD selected');
    } else {
        console.log('SOFTWOOD selected');
    }
});

// Existing or additional JavaScript logic below
document.getElementById('indoor-outdoor-input').addEventListener('change', function() {
    if (this.checked) {
        console.log('OUTDOOR selected');
    } else {
        console.log('INDOOR selected');
    }
    updateRecommendedProductImage(); // Set the initial recommended product image
    adjustCanvasWidth(); // Adjust the canvas width based on the current viewport
});
