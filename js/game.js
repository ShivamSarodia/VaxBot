var logMoves = false;

var numberOfIndividuals, meanDegree, rewire = 0.1;
var graph = {};
var force,node, link;
var scenarioTitle;

var resizingParameter = 2;
var invisibleParameter = 1.9;

var transmissionRate,recoveryRate;
var transmissionRates = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
var recoveryRates = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
var independentOutbreaks = 1;

var numberVaccinated;
var numberQuarantined;
var numberSaved;
var numberInfected;
var numberOfRefusers;

var gameSVG ;
var width = 925;
var height = 750 - 45 - 50;  // standard height - footer:height - footer:bottomMargin
var charge = -900;
var friction = 0.9;

var numberOfVaccines = 0;
var vaccineSupply = 0;

var difficultyString;
var customNodeChoice;
var customNeighborChoice;
var customVaccineChoice;
var customOutbreakChoice;
var customRefuserChoice;

var timestep = 0;
var newInfections = [];
var exposureEdges = [];
var xyCoords = [];
var diseaseIsSpreading = false;
var timeToStop = false;

var infectedBar;
var uninfectedBar;
var infectedHeight;
var uninfectedHeight;

var game;

var easyBar = 70;
var mediumBar = 50;
var hardBar = 40;

var vaxEasyCompletion;
var vaxMediumCompletion;
var vaxHardCompletion;

var vaxEasyHiScore;
var vaxMediumHiScore;
var vaxHardHiScore;

var vaxEasyHiScoreRT;
var vaxMediumHiScoreRT;
var vaxHardHiScoreRT;

var easyScores;
var mediumScores;
var hardScores;
var scores = {easy: easyScores, medium: mediumScores, hard: hardScores};

var easyScoresRT;
var mediumScoresRT;
var hardScoresRT;
var scoresRT = {easy: easyScoresRT, medium: mediumScoresRT, hard: hardScoresRT};

var currentNode;
var currentElement;

var cookie = {};
var pop;

var best;
var current;

// fine tuning the drag versus click differentiation
var originalLocation = [0,0];
var newLocation = [0,0];
var dragStartDateObject;
var dragStartMillis;
var dragEndDateObject;
var dragEndMillis;
var clickTime;
var dragDistanceThreshold = 10;
var clickTimeThreshold = 100;

initBasicMenu();

function readCookiesJSON() {
    // Loads default values into variables.

    vaxEasyCompletion = false;
    vaxMediumCompletion = false;
    vaxHardCompletion = false;

    vaxEasyHiScore = []
    vaxMediumHiScore = []
    vaxHardHiScore = []

    vaxEasyHiScoreRT = Math.max.apply(Math, [])
    vaxMediumHiScoreRT = Math.max.apply(Math, [])
    vaxHardHiScoreRT = Math.max.apply(Math, [])

    customNodeChoice = 75;
    customNeighborChoice = 3;
    customVaccineChoice = 10;
    customOutbreakChoice = 2;
    customRefuserChoice = 0.05;

    cookieBasedModeSelection();
}

function cookieBasedModeSelection() {

    if (vaxEasyHiScore == -Infinity) {}
    else {

        if (speed) {
            d3.select(".easyHi")
                .text("(Best: " + vaxEasyHiScoreRT + "%)")

        }
        else {
            d3.select(".easyHi")
                .text("(Best: " + vaxEasyHiScore + "%)")

        }

    }

    if (vaxMediumHiScore == -Infinity) {}
    else {
        if (speed) {
            d3.select(".mediumHi")
                .text("(Best: " + vaxMediumHiScoreRT + "%)")

        }
        else {
            d3.select(".mediumHi")
                .text("(Best: " + vaxMediumHiScore + "%)")

        }

    }

    if (vaxHardHiScore == -Infinity) {}
    else {
        if (speed) {
            d3.select(".hardHi")
                .text("(Best: " + vaxHardHiScoreRT + "%)")

        }
        else {
            d3.select(".hardHi")
                .text("(Best: " + vaxHardHiScore + "%)")

        }

    }



    d3.select("#difficultyEasy")
        .on("mouseover", function() {
            d3.select(this).style("color", "#2692F2")
        })
        .on("mouseout", function() {
            d3.select(this).style("color", "#707070")
        })

    // set medium based on easy
    if (vaxEasyCompletion == true) {
        d3.select("#difficultyMedium")
            .attr("class", "difficultyItem")
            .on("mouseover", function() {
                d3.select(this).style("color", "#2692F2")
            })
            .on("mouseout", function() {
                d3.select(this).style("color", "#707070")
            })
            .on("click", function() {
                difficultyString = "medium";
                initBasicGame(difficultyString)
            });
    }
    else {
        d3.select("#difficultyMedium")
            .attr("class", "difficultyItemGrey")
            .on("mouseover", function() {})
            .on("mouseout", function() {})
            .on("click", function() {})
    }

    // set hard based on medium
    if (vaxMediumCompletion == true) {
        d3.select("#difficultyHard")
            .attr("class", "difficultyItem")
            .on("mouseover", function() {
                d3.select(this).style("color", "#2692F2")
            })
            .on("mouseout", function() {
                d3.select(this).style("color", "#707070")
            })
            .on("click", function() {
                difficultyString = "hard";
                initBasicGame(difficultyString)
            });
    }
    else {
        d3.select("#difficultyHard")
            .attr("class", "difficultyItemGrey")
            .on("mouseover", function() {})
            .on("mouseout", function() {})
            .on("click", function() {})
    }

    // set custom based on hard
    if (vaxHardCompletion == true) {
        d3.select("#difficultyCustom")
            .attr("class", "difficultyItem")
            .on("mouseover", function() {
                d3.select(this).style("color", "#2692F2")
            })
            .on("mouseout", function() {
                d3.select(this).style("color", "#707070")
            })
            .on("click", function() {
                d3.select(".difficultySelection").remove()
                initCustomMenu();
            });

    }
    else {
        d3.select("#difficultyCustom")
            .attr("class", "difficultyItemGrey")
            .on("mouseover", function() {})
            .on("mouseout", function() {})
            .on("click", function() {})
    }
}


function initBasicGame(difficulty) {
    d3.select(".difficultySelection").remove();
    d3.select(".difficultySelection").remove();
    d3.select(".newGameHeader").remove();
    d3.select("#customMenuDiv").remove();

    graph             = {}    ;
    graph.nodes       = []    ;
    graph.links       = []    ;

    if (difficulty == "easy") {
        numberOfIndividuals = 50;
        meanDegree = 3;
        numberOfVaccines = 5;
        independentOutbreaks = 1;
        transmissionRate = transmissionRates[7];
        recoveryRate = recoveryRates[0];
    }

    if (difficulty == "medium") {
        numberOfIndividuals = 75;
        meanDegree = 4;
        numberOfVaccines = 7;
        independentOutbreaks = 2;
        transmissionRate = transmissionRates[7];
        recoveryRate = recoveryRates[0];
    }

    if (difficulty == "hard") {
        charge = -300;
        numberOfIndividuals = 100;
        meanDegree = 4;
        numberOfVaccines = 15;
        transmissionRate = transmissionRates[4];
        recoveryRate = recoveryRates[0];
        independentOutbreaks = 3;
    }

    graph = generateSmallWorld(numberOfIndividuals, rewire, meanDegree);

    for (var i = 0; i < graph.nodes.length; i++) {
        graph.nodes[i].fixed = false;
    }

    if (difficulty == "hard") {
        for (var i = 0; i < graph.nodes.length; i++) {
            if (Math.random() < 0.05) graph.nodes[i].refuser = true;
        }
    }

    removeDuplicateEdges(graph);
    initGameSpace();

}

function initCustomGame() {
    d3.select(".vaxLogoDiv").remove();

    scenarioTitle = "custom";
    difficultyString = null;

    d3.select(".newGameHeader").remove();
    graph             = {}    ;
    graph.nodes       = []    ;
    graph.links       = []    ;

    transmissionRate = 0.50;

    numberOfIndividuals = customNodeChoice;
    meanDegree = customNeighborChoice;
    numberOfVaccines = customVaccineChoice;
    vaccineSupply = numberOfVaccines;
    independentOutbreaks = customOutbreakChoice;
    numberOfRefusers = customRefuserChoice;

    if (numberOfVaccines == 0) numberOfVaccines = 1;
    if (independentOutbreaks < (numberOfIndividuals - numberOfVaccines)) independentOutbreaks = 1;

    if (customNodeChoice > 100) charge = -150;
    if (customNodeChoice > 125) charge = -130;

    graph = generateSmallWorld(numberOfIndividuals, rewire, meanDegree);
    removeDuplicateEdges(graph);

    for (var i = 0; i < graph.nodes.length; i++) {
        graph.nodes[i].refuser = false;
    }

    for (var i = 0; i < numberOfRefusers; i++) {
        do {
            var node = graph.nodes[Math.floor(Math.random() * graph.nodes.length)]
        }
        while (node.refuser)
        node.refuser = true;
    }

    // prevent all nodes from being refusers and halting the game
    var refuserCount = 0;
    for (var i = 0; i < graph.nodes.length; i++) {
        if (graph.nodes[i].refuser) refuserCount++;
    }

    if (refuserCount == numberOfIndividuals) {
        numberOfVaccines = 1;
        graph.nodes[0].refuser = false;
    }


    d3.select("#customMenuDiv").style("right", "-1000px").style("visibility", "hidden")

    window.setTimeout(function() {
        d3.select("#customMenuDiv").remove()
        initGameSpace();
    }, 500);

}

function initGameSpace() {
    d3.select(".vaxLogoDiv").remove();

    pop = document.getElementById('audio');
    game = true;

    d3.select(".actionVax").style("visibility", "visible");
    d3.select(".actionVax").style("right", 0);

    d3.select("#vaxShieldText").style("color", "white")

    d3.select(".actionVax").append("text")
        .attr("class", "vaccineCounterText")
        .style("font-size", "16px")
        .style("font-family", "Nunito")
        .style("font-weight", 300)
        .style("color", "white")
        .text("")
        .style("right", function() {
            if (numberOfVaccines.toString().length == 1) return "49px"
            if (numberOfVaccines.toString().length == 2) return "46px"

        })

    d3.select(".vaccineCounterText").text(numberOfVaccines)

    initFooter();
    window.setTimeout(function() {d3.select(".gameMenuBox").style("right", "-10px"); d3.select(".gameVaxLogoDiv").style("left", "-12px")},1)



    vaccinateMode     = false ;
    quarantineMode    = false ;
    numberVaccinated  = 0     ;
    numberQuarantined = 0     ;

    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isIE = /*@cc_on!@*/false || document.documentMode;   // At least IE6


    if (isFirefox || isIE) {
        gameSVG = d3.select("body").append("svg")
            .attr({
                "width": 950,
                "height": 768 - 45
            })
            .attr("class", "gameSVG")
            .attr("pointer-events", "all")
            .append('svg:g');



    }
    else {
        gameSVG = d3.select("body").append("svg")
            .attr({
                "width": "75%",
                "height": "80.5%"  //footer takes ~12.5% of the page
            })
            .attr("viewBox", "0 0 " + width + " " + height )
            .attr("class", "gameSVG")
            .attr("pointer-events", "all")
            .style("margin-left", 135)
            .append('svg:g');
    }

    // initialize force layout. point to nodes & links.  size based on prior height and width.  set particle charge. setup step-wise force settling.
    force = d3.layout.force()
        .nodes(graph.nodes)
        .links(graph.links)
        .size([width, height])
        .charge(charge)
        .friction(friction)
        .on("tick", tick)
        .start();

// associate empty SVGs with link data. assign attributes.
    link = gameSVG.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link");

// associate empty SVGs with node data. assign attributes. call force.drag to make them moveable.

    clickArea = gameSVG.selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("class", "clickArea")
        .attr("r", function(node) {
            var clickAreaSize;

            if (difficultyString == "easy") clickAreaSize = (invisibleParameter) * nodeSize(node);

            if (difficultyString == "medium") clickAreaSize = (invisibleParameter-0.2) * nodeSize(node);

            if (difficultyString == "hard") clickAreaSize = (invisibleParameter-0.3) * nodeSize(node);

            return clickAreaSize;
        })
        .attr("fill", "black")
        .attr("opacity", 0)
        .on("click", function(node) {
            if (speed) speedModeGameClick(node);
            else gameClick(node);
        })
        .call(d3.behavior.drag()
            .on("dragstart", function(node) {
                dragStartDateObject = {};
                dragStartMillis = 0;
                dragEndMillis = 0;
                clickTime = 10000;
                dragStartDateObject = new Date();
                dragStartMillis = dragStartDateObject.getMilliseconds();
                originalLocation = [];
                newLocation = [];




                originalLocation[0] = node.x;
                originalLocation[1] = node.y;
                node.fixed = true;

            })
            .on("drag", function(node) {
                node.px += d3.event.dx;
                node.py += d3.event.dy;
                node.x += d3.event.dx;
                node.y += d3.event.dy;
                tick();

                newLocation[0] = node.x;
                newLocation[1] = node.y;

            })
            .on("dragend", function(node) {
                dragEndDateObject = new Date();
                dragEndMillis = dragEndDateObject.getMilliseconds();
                clickTime = Math.abs(dragEndMillis - dragStartMillis);

                node.fixed = false;
                tick();
                force.resume();

                // ACCOUNT FOR MICRO-MOVEMENT DURING INTENDED CLICK
                // if dragDistance is very small
                if (getCartesianDistance(originalLocation, newLocation) < dragDistanceThreshold) {
                    // AND clickTime very fast
                    if (clickTime < clickTimeThreshold) {
                        // assume intended click
                        if (speed) speedModeGameClick(node);
                        else gameClick(node);
                    }
                }
                //ACCOUNT FOR LARGE-FAST MOVEMENT DURING INTENDED CLICK
                // however, if dragDistance is larger than the threshold
                else {
                    // but the clickTime is still very fast
                    if (clickTime < clickTimeThreshold) {
                        // assume intended click
                        if (speed) speedModeGameClick(node);
                        else gameClick(node);
                    }
                }


            })


        )

    node = gameSVG.selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", nodeSize)
        .attr("fill", nodeColor)
        .on("click", function(d) {
            if (speed) speedModeGameClick(d);
            else gameClick(d);
        })
        .on("mouseover", function(d) {
            d3.select(this).style("stroke-width","3px");
            currentNode = d;
            currentElement = d3.select(this);
        })
        .on("mouseout", function(d) {
            d3.select(this).style("stroke-width","2px")
            if (currentNode.fixed == true) d3.select(this).style("stroke-width","3px");
            currentNode = null;
            currentElement = null;
        })
        .call(d3.behavior.drag()
            .on("dragstart", function(node) {
                dragStartDateObject = {};
                dragStartMillis = 0;
                dragEndMillis = 0;
                clickTime = 10000;
                dragStartDateObject = new Date();
                dragStartMillis = dragStartDateObject.getMilliseconds();
                originalLocation = [];
                newLocation = [];




                originalLocation[0] = node.x;
                originalLocation[1] = node.y;
                node.fixed = true;

            })
            .on("drag", function(node) {
                node.px += d3.event.dx;
                node.py += d3.event.dy;
                node.x += d3.event.dx;
                node.y += d3.event.dy;
                tick();

                newLocation[0] = node.x;
                newLocation[1] = node.y;

            })
            .on("dragend", function(node) {
                dragEndDateObject = new Date();
                dragEndMillis = dragEndDateObject.getMilliseconds();
                clickTime = Math.abs(dragEndMillis - dragStartMillis);

                node.fixed = false;
                tick();
                force.resume();

                // ACCOUNT FOR MICRO-MOVEMENT DURING INTENDED CLICK
                // if dragDistance is very small
                if (getCartesianDistance(originalLocation, newLocation) < dragDistanceThreshold) {
                    // AND clickTime very fast
                    if (clickTime < clickTimeThreshold) {
                        // assume intended click
                        if (speed) speedModeGameClick(node);
                        else gameClick(node);
                    }
                }
                //ACCOUNT FOR LARGE-FAST MOVEMENT DURING INTENDED CLICK
                // however, if dragDistance is larger than the threshold
                else {
                    // but the clickTime is still very fast
                    if (clickTime < clickTimeThreshold) {
                        // assume intended click
                        if (speed) speedModeGameClick(node);
                        else gameClick(node);
                    }
                }


            })


        )

    if (difficultyString == "hard") refusersPresent();
    if (difficultyString == null || numberOfRefusers>0) refusersPresent();

    // d3.enter().append("rect")
    //     .attr("class", "background")
    //     .style("visibility", "hidden")
    //     .style("cursor", "crosshair");

    if (toggleDegree && difficultyString == "easy") {
        charge = -850;
    }
    if (toggleDegree && difficultyString == "medium") {
        charge = -450;
    }
    if (toggleDegree && difficultyString == "hard") {
        charge = -300;
    }

    activateGameVaccinationMode();
}

function nodeSize(node) {
    var size;
    if (toggleDegree) {
        size = (findNeighbors(node).length + 1.5) * resizingParameter;
    }
    else size = 8;
    return size;
}

function nodeColor(node) {
    var color = null;
    if (node.status == "S") color = "#b7b7b7";
    if (node.status == "E") color = "#ef5555";
    if (node.status == "I") color = "#ef5555";
    if (node.status == "R") color = "#9400D3";
    if (node.status == "V") color = "#76A788";
    if (node.status == "Q") color = "#d9d678";

    if (node.status == "S" && node.refuser) {
        color = "#fab45a"
    }

    return color;
}

function gameClick(node) {
    if (vaccinateMode && !node.refuser && node.status != "V") {
	if(logMoves) console.log("Node clicked: " + node.id);

	node.status = "V";
        numberOfVaccines--;
        numberVaccinated++;

	if(logMoves) console.log("Vaccines remaining: " + numberOfVaccines);

	if (numberOfVaccines == 0 && !diseaseIsSpreading) loadGameQuarantine();

	gameUpdate();

	return true;
    }
    else if (quarantineMode && node.status == "S") {
	if(logMoves) console.log("Node clicked: " + node.id);

        diseaseIsSpreading = true;
        node.status = "Q";
        numberQuarantined++;

	if(logMoves) console.log("Number quarantined: " + numberQuarantined);

	gameUpdate();
	gameTimesteps();

	return true;
    }

    return false;
}

function speedModeGameClick(node) {
    if (vaccinateMode) {
        if (node.refuser == true) return;

        try {
            pop.play()
        }
        catch(err){

        }
        node.status = "V";
        numberOfVaccines--;
        numberVaccinated++;
    }
    else {
        if (quarantineMode && node.status == "S") {
            if (!diseaseIsSpreading) speedModeTimesteps();

            try {
                pop.play()
            }
            catch(err){

            }
            diseaseIsSpreading = true;
            node.status = "Q";
            numberQuarantined++;
        }
    }

    if (numberOfVaccines == 0 && !diseaseIsSpreading) loadGameQuarantine();

    gameUpdate();

}


// tick function, which does the physics for each individual node & link.
function tick() {
    clickArea.attr("cx", function(d) { return d.x = Math.max(8, Math.min(width - 8, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(8, Math.min((height *.85), d.y)); });

    node.attr("cx", function(d) { return d.x = Math.max(8, Math.min(width - 8, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(8, Math.min((height *.85), d.y)); });

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

}

function countSavedGAME() {
    var counter = 0;
    for (var i = 0; i < graph.nodes.length; i++) {
        if (graph.nodes[i].status == "S") counter++;
    }
    return counter;
}

function gameUpdate() {
    friction = 0.83;

    d3.select(".vaccineCounterText").text(numberOfVaccines)
    d3.select(".quarantineCounterText").text("x" + numberQuarantined)
    var nodes = removeVaccinatedNodes(graph);
    var links = removeOldLinks(graph);
    graph.links = links;
    updateCommunities();

    force
        .nodes(nodes)
        .charge(charge)
        .friction(friction)
        .links(links)
        .start();

    link = gameSVG.selectAll("line.link")
        .data(links, function(d) { return d.source.id + "-" + d.target.id;});

    link.enter().insert("svg:line", ".node")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // Exit any old links.
    link.exit().remove();

    // Update the nodes…
    node = gameSVG.selectAll("circle.node")
        .data(nodes, function(d) { return d.id })
        .style("fill", nodeColor)

    d3.selectAll(".node")
        .transition()
        .duration(100)
        .attr("r", nodeSize)

    d3.selectAll(".clickArea")
        .attr("fill", "black")
        .attr("opacity", 0)
        .on("click", function(node) {
            if (node.status == "V" || node.status == "Q") return;
            else {
                if (speed) speedModeGameClick(node);
                else gameClick(node);
            }
        })
        .attr("r", function(node) {
            var clickAreaSize;
            if (findNeighbors(node).length <= 1) clickAreaSize = 0;
            else {
                if (difficultyString == "easy") {
                    clickAreaSize = 1.9 * nodeSize(node);
                }
                if (difficultyString == "medium") {
                    clickAreaSize = (invisibleParameter-0.2) * nodeSize(node);
                }
                if (difficultyString == "hard") {
                    clickAreaSize = (invisibleParameter-0.3) * nodeSize(node);
                }
            }
            return clickAreaSize;
        })



    // Enter any new nodes.
    node.enter().append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .style("fill", nodeColor)
        .on("click", function(d) {
            if (speed) speedModeGameClick(d)
            else gameClick(d);
        })
        .call(force.drag);

    // Exit any old nodes.
    node.exit().remove();

}



function gameTimesteps() {
    infection();
    stateChanges();
    newInfections = [];
    newInfections = updateExposures();
    timestep++;
    detectGameCompletion();
    if (!timeToStop) {
        animateGamePathogens_thenUpdate();
    }
    else {
        animateGamePathogens_thenUpdate();
    }
}

function speedModeTimesteps() {
    infection();
    stateChanges();
    newInfections = [];
    newInfections = updateExposures();
    timestep++;
    detectGameCompletion();
    if (!timeToStop) {
        animateGamePathogens_thenUpdate();
        window.setTimeout(speedModeTimesteps, 1750)
    }
    else {
        animateGamePathogens_thenUpdate();
    }

}

function detectGameCompletion() {
    if (timeToStop || !diseaseIsSpreading) return

    updateCommunities();
    var numberOf_AtRisk_communities = 0;
    for (var groupIndex = 1; groupIndex < numberOfCommunities+1; groupIndex++) {
        var numberOfSusceptiblesPerGroup = 0;
        var numberOfInfectedPerGroup = 0;

        for (var nodeIndex = 0; nodeIndex < graph.nodes.length; nodeIndex++) {
            var node = graph.nodes[nodeIndex];
            if (parseFloat(node.group) != groupIndex); //do nothing
            else {
                if (node.status == "S") numberOfSusceptiblesPerGroup++;
                if (node.status == "I") numberOfInfectedPerGroup++;
                if (node.status == "E") numberOfInfectedPerGroup++;
            }
        }
        if (numberOfInfectedPerGroup > 0) {
            if (numberOfSusceptiblesPerGroup > 0) {
                numberOf_AtRisk_communities++;
            }
        }
    }

    if (numberOf_AtRisk_communities == 0 && diseaseIsSpreading) {
        diseaseIsSpreading = false;
        timeToStop = true;
        animateGamePathogens_thenUpdate();

	// had timeout
	endGameSession();
    }
}

function animateGamePathogens_thenUpdate() {
    gameUpdate();
}

function popNewGameInfection() {
    d3.selectAll(".node")
        .transition()
        .duration(500)
        .attr("r", function(d) {
            var currentSize;
            if (toggleDegree) currentSize = (findNeighbors(d).length + 1.5) * resizingParameter;
            else currentSize = 8;

            if (d.status == "I") {
                if (timestep - d.exposureTimestep == 1) return currentSize * 1.5;
                else return currentSize;
            }
            else return currentSize;
        })
}

function moveGamePathogens() {
    d3.selectAll(".pathogen")
        .sort()
        .transition()
        .duration(600)
        .attr("cx", function(d) { return d.receiverX} )
        .attr("cy", function(d) { return d.receiverY} );
}

function createGamePathogens() {
    xyCoords = getPathogen_xyCoords(newInfections);

    var pathogen = gameSVG.selectAll(".pathogen")
        .data(xyCoords)
        .enter()
        .append("circle")
        .attr("class", "pathogen")
        .attr("cx", function(d) { return d.transmitterX })
        .attr("cy", function(d) { return d.transmitterY })
        .attr("r", 4)
        .style("fill", "black")
}


function getPathogen_xyCoords(newInfections) {
    var xyCoords = [];
    var recentTransmitters = [];
    for (var i = 0; i < newInfections.length; i++) {
        recentTransmitters.push(newInfections[i].infectedBy);
        var coordString = {id: i, receiverX: newInfections[i].x, receiverY: newInfections[i].y, transmitterX: newInfections[i].infectedBy.x, transmitterY: newInfections[i].infectedBy.y}
        xyCoords.push(coordString);
    }
    return xyCoords;
}


function removeGamePathogens() {
    d3.selectAll(".node")
        .transition()
        .duration(200)
        .attr("r", 8)

    d3.selectAll(".pathogen")
        .transition()
        .duration(200)
        .style("opacity", 0)

    d3.selectAll(".pathogen").remove();
}


function gameIndexPatients() {
    quarantineMode = true;
    var indexPatientID = 0;
    while(independentOutbreaks > 0) {
        do {
            indexPatientID = Math.floor(Math.random() * graph.nodes.length);
        }
        while (graph.nodes[indexPatientID].status != "S");

        graph.nodes[indexPatientID].status = "I";
        graph.nodes[indexPatientID].infectedBy = "indexPatient";
        graph.nodes[indexPatientID].exposureTimestep = 0;
        independentOutbreaks--;

    }
    gameUpdate();
}


function loadGameSyringe() {
    d3.select(".actionVax").style("visibility", "visible");
    d3.select(".actionVax").style("right", 0);

    d3.select("#vaxShieldText").style("color", "white")

    d3.select(".actionVax").append("text")
        .attr("class", "vaccineCounterText")
        .style("font-size", "16px")
        .style("font-family", "Nunito")
        .style("font-weight", 300)
        .style("color", "white")
        .text("")
        .style("right", function() {
            if (numberOfVaccines.toString().length == 1) return "49px"
            if (numberOfVaccines.toString().length == 2) return "46px"

        })

    d3.select(".vaccineCounterText").text(numberOfVaccines)

    window.setTimeout(activateGameVaccinationMode, 100)
}

function hideGameSyringe() {
    vaccinationMode = false;
    d3.select(".actionVax").style("right", "-200px")
    d3.select(".gameSVG").style("cursor", 'pointer');
    d3.selectAll(".node").style("cursor", 'pointer');
    d3.select(".vaccineDepressedState").style("visibility", "hidden")
}

function loadGameQuarantine() {
    if (vaccinateMode) hideGameSyringe();
    vaccinateMode = false;
    d3.select(".actionQuarantine").style("visibility", "visible");
    d3.select(".actionQuarantine").style("right", "0px");

    d3.select(".quarantineCounterText").remove()

    d3.select("#quarantineText").style("color", "white")

    d3.select(".actionQuarantine").append("text")
        .attr("class", "quarantineCounterText")
        .style("font-size", "16px")
        .style("font-family", "Nunito")
        .style("font-weight", 300)
        .style("color", "white")
        .text("")

    d3.select(".quarantineCounterText").text("x" + numberQuarantined)

    activateGameQuarantineMode();
}

function hideGameQuarantine() {
    quarantineMode = false;
    d3.select(".actionQuarantine").style("right", "-200px")
    d3.select(".gameSVG").style("cursor", 'pointer');
    d3.selectAll(".node").style("cursor", 'pointer');
    d3.select(".quarantineDepressedState").style("visibility", "hidden")
}

function activateGameVaccinationMode() {
    vaccinateMode = true;
    d3.selectAll(".node").style("cursor", 'url(/assets/vax_cursor.cur)');
    d3.select(".gameSVG").style("cursor", 'url(/assets/vax_cursor.cur)');
    d3.select(".vaccineCounterText").text(numberOfVaccines);
    d3.select(".vaccineDepressedState").style("visibility", "visible")

}

function activateGameQuarantineMode() {
    vaccinateMode = false;
    quarantineMode = true;
    d3.selectAll(".node").style("cursor", 'url(/assets/vax_cursor.cur)');
    d3.select(".gameSVG").style("cursor", 'url(/assets/vax_cursor.cur)');
    d3.select(".quarantineDepressedState").style("visibility", "visible")

    gameIndexPatients();

    if(logMoves) console.log("Quarantine mode engaged");
}

function refusersPresent() {
    d3.select(".gameSVG").append("rect")
        .attr("class", "refuserNotifyShadow")
        .attr("x", window.innerWidth/4 + 62 + 5 - 50)
        .attr("y", -100)
        .attr("width", 325)
        .attr("height", 50)
        .attr("fill", "#838383")
        .attr("opacity", 1)

    d3.select(".gameSVG").append("rect")
        .attr("class", "refuserNotifyBox")
        .attr("x", window.innerWidth/4 + 62 - 50)
        .attr("y", -100)
        .attr("width", 325)
        .attr("height", 50)
        .attr("fill", "#85bc99")
        .attr("opacity", 1)

    d3.select(".gameSVG").append("text")
        .attr("class", "refuserNotifyText")
        .attr("x", window.innerWidth/4 + 62 + 5 - 50 + 15)
        .attr("y", -100)
        .attr("fill", "white")
        .style("font-family", "Nunito")
        .style("font-size", "24px")
        .style("font-weight", 300)
        .text("Vaccine refusers present!")
        .attr("opacity", 1)

    d3.select(".refuserNotifyText").transition().duration(500).attr("y", 200 + 32)
    d3.select(".refuserNotifyBox").transition().duration(500).attr("y", 200)
    d3.select(".refuserNotifyShadow").transition().duration(500).attr("y", 200 + 7)

    window.setTimeout(function() {
        d3.select(".refuserNotifyShadow")
            .transition()
            .duration(500)
            .attr("y", -100)

        d3.select(".refuserNotifyBox")
            .transition()
            .duration(500)
            .attr("y", -100)

        d3.select(".refuserNotifyText")
            .transition()
            .duration(500)
            .attr("y", -100)


    }, 2500)


}

function outbreakDetected() {
    d3.select(".gameSVG").append("rect")
        .attr("class", "outbreakNotifyShadow")
        .attr("x", window.innerWidth/4 + 62 + 5 - 50)
        .attr("y", -100)
        .attr("width", 250)
        .attr("height", 50)
        .attr("fill", "#838383")
        .attr("opacity", 1)

    d3.select(".gameSVG").append("rect")
        .attr("class", "outbreakNotifyBox")
        .attr("x", window.innerWidth/4 + 62 - 50)
        .attr("y", -100)
        .attr("width", 250)
        .attr("height", 50)
        .attr("fill", "#85bc99")
        .attr("opacity", 1)

    d3.select(".gameSVG").append("text")
        .attr("class", "outbreakNotifyText")
        .attr("x", window.innerWidth/4 + 62 + 5 - 50 + 12)
        .attr("y", -100)
        .attr("fill", "white")
        .style("font-family", "Nunito")
        .style("font-size", "24px")
        .style("font-weight", 300)
        .text("Outbreak Detected!")
        .attr("opacity", 1)

    d3.select(".outbreakNotifyText").transition().duration(500).attr("y", window.innerHeight/2 - 300 + 100 - 70 + 5)
    d3.select(".outbreakNotifyBox").transition().duration(500).attr("y", window.innerHeight/2 - 300)
    d3.select(".outbreakNotifyShadow").transition().duration(500).attr("y", window.innerHeight/2 - 300 + 7)

    window.setTimeout(function() {
        d3.select(".outbreakNotifyShadow")
            .transition()
            .duration(500)
            .attr("y", -100)

        d3.select(".outbreakNotifyBox")
            .transition()
            .duration(500)
            .attr("y", -100)

        d3.select(".outbreakNotifyText")
            .transition()
            .duration(500)
            .attr("y", -100)


    }, 2000)

}

function endGameSession() {
    if(logMoves) console.log("Game over");

    d3.select(".gameSVG").append("rect")
        .attr("class", "endGameShadow")
        .attr("x", window.innerWidth/4 + 62 + 5 - 100)
        .attr("y", -100)
        .attr("width", 500)
        .attr("height", 125)
        .attr("fill", "#838383")


    d3.select(".gameSVG").append("rect")
        .attr("class", "endGameBox")
        .attr("x", window.innerWidth/4 + 62 - 100)
        .attr("y", -100)
        .attr("width", 500)
        .attr("height", 125)
        .attr("fill", "#85bc99")

    d3.select(".gameSVG").append("text")
        .attr("class", "endGameText")
        .attr("x", window.innerWidth/4 + 135 - 100)
        .attr("y", -100)
        .style("font-family", "Nunito")
        .style("fill", "white")
        .style("font-weight", 500)
        .style("font-size", "25px")
        .text("Outbreak has run its course.")

    d3.select(".gameSVG").append("text")
        .attr("class", "endGameSUBMIT")
        .attr("x", window.innerWidth/4 + 275 - 90)
        .attr("y", -100)
        .style("font-family", "Nunito")
        .style("fill", "white")
        .style("font-weight", 500)
        .style("font-size", "15px")
        .style("cursor", "pointer")
        .text("Submit")
        .on("mouseover", function(d) {

            d3.select(this).style("fill", "#2692F2")

        })
        .on("mouseout", function(d) {
            d3.select(this).style("fill", "white")
        })
        .on("click", function() {
            d3.select(".endGameText")
                .transition()
                .duration(250)
                .attr("x", window.innerWidth/4 + 85)
                .text("Reticulating splines.")

            window.setTimeout(addPeriod1, 350)

            window.setTimeout(addPeriod2, 800)

            window.setTimeout(initScoreRecap, 1200)

        })

    d3.select(".endGameBox").transition().duration(500).attr("y", window.innerHeight/2 - 300)
    d3.select(".endGameShadow").transition().duration(500).attr("y", window.innerHeight/2 - 300 + 7)
    d3.select(".endGameText").transition().duration(500).attr("y", window.innerHeight/2 - 250)
    d3.select(".endGameSUBMIT").transition().duration(500).attr("y", window.innerHeight/2 - 250 + 50)


}

function addPeriod1() {
    d3.select(".endGameText")
        .transition()
        .duration(250)
        .attr("x", window.innerWidth/4 + 85)
        .text("Reticulating splines..")
}

function addPeriod2() {
    d3.select(".endGameText")
        .transition()
        .duration(250)
        .attr("x", window.innerWidth/4 + 85)
        .text("Reticulating splines...")
}

function setCookies() {
    var proportionSaved = Math.round((((countSavedGAME() + numberQuarantined + numberVaccinated)/numberOfIndividuals)*100)).toFixed(0)

    if (difficultyString == "easy") {
        if (speed) {
            if ($.cookie('vaxEasyHiScoreRT') < proportionSaved) $.cookie('vaxEasyHiScoreRT', proportionSaved)
            if (proportionSaved >= easyBar) $.cookie('vaxEasyCompletion', 'true')

        }
        else {
            if ($.cookie('vaxEasyHiScore') < proportionSaved) $.cookie('vaxEasyHiScore', proportionSaved)
            if (proportionSaved >= easyBar) $.cookie('vaxEasyCompletion', 'true')
        }

    }

    if (difficultyString == "medium") {
        if (speed) {
            if ($.cookie('vaxMediumHiScoreRT') < proportionSaved) $.cookie('vaxMediumHiScoreRT', proportionSaved)
            if (proportionSaved >= mediumBar) $.cookie('vaxMediumCompletion', 'true')
        }
        else {
            if ($.cookie('vaxMediumHiScore') < proportionSaved) $.cookie('vaxMediumHiScore', proportionSaved)
            if (proportionSaved >= mediumBar) $.cookie('vaxMediumCompletion', 'true')
        }


    }

    if (difficultyString == "hard") {
        if (speed) {
            if ($.cookie('vaxHardHiScoreRT') < proportionSaved)$.cookie('vaxHardHiScoreRT', proportionSaved)
            if (proportionSaved >= hardBar) $.cookie('vaxHardCompletion', 'true')
        }
        else {
            if ($.cookie('vaxHardHiScore') < proportionSaved)$.cookie('vaxHardHiScore', proportionSaved)
            if (proportionSaved >= hardBar) $.cookie('vaxHardCompletion', 'true')
        }

    }
}

function generateStackedBarChart() {
    var width = 125;
    var height = 320;

    var stackedSVG = d3.select(".gameSVG").append("svg")
        .attr("class", "stacked")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 20)
        .attr("y", 150)
        .append("svg:g")
        .attr("transform", "translate(10,320)");

    x = d3.scale.ordinal().rangeRoundBands([0, width-50])
    y = d3.scale.linear().range([0, height])
    z = d3.scale.ordinal().range(["#b7b7b7","#85BC99","#d9d678" , "#ef5555" ])
    // 1 column
    var matrix = [
        [ 1,  countSavedGAME(), numberVaccinated, numberQuarantined, (numberOfIndividuals - numberQuarantined - numberVaccinated - countSavedGAME())]

    ];

    var remapped =["uninfected","vaccinated", "quarantined", "infected"].map(function(dat,i){
        return matrix.map(function(d,ii){
            return {x: ii, y: d[i+1] };
        })
    });

    var stacked = d3.layout.stack()(remapped)

    x.domain(stacked[0].map(function(d) { return d.x; }));
    y.domain([0, d3.max(stacked[stacked.length - 1], function(d) { return d.y0 + d.y; })]);


    // Add a group for each column.
    var valgroup = stackedSVG.selectAll("g.valgroup")
        .data(stacked)
        .enter().append("svg:g")
        .attr("class", "valgroup")
        .style("fill", function(d, i) { return z(i); })
        .attr("id", function(d,i) { if (i == 0) return "uninfected"; if (i == 1) return "infected"; if (i == 2) return "quarantined"; if (i == 3) return "vaccinated"})

    // Add a rect for each date.
    var rect = valgroup.selectAll("rect")
        .data(function(d){return d;})
        .enter().append("svg:rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return -y(d.y0) - y(d.y); })
        .attr("height", function(d) { return y(d.y); })
        .attr("width", x.rangeBand())
        .attr("id", function(d) {console.log(d)})

    d3.select(".gameSVG").append("line")
        .style("stroke", "#707070")
        .style("stroke-width", "1px")
        .attr("x1", -35)
        .attr("x2", 200)
        .attr("y1", 470)
        .attr("y2", 470)

    d3.select(".gameSVG").append("line")
        .style("stroke", "#707070")
        .style("stroke-width", "1px")
        .attr("x1", -35)
        .attr("x2", -35)
        .attr("y1", 140)
        .attr("y2", 470)

    d3.select(".gameSVG").append("text")
        .attr("x", -83)
        .attr("y", 162)
        .style("font-family", "Nunito")
        .style("font-size", "15px")
        .style("font-weight", "500")
        .style("fill", "#707070")
        .text("100%")

    d3.select(".gameSVG").append("text")
        .attr("x", -76)
        .attr("y", 310)
        .style("font-family", "Nunito")
        .style("font-size", "15px")
        .style("font-weight", "500")
        .style("fill", "#707070")
        .text("50%")

    d3.select(".gameSVG").append("text")
        .attr("x", -72)
        .attr("y", 455)
        .style("font-family", "Nunito")
        .style("font-size", "15px")
        .style("font-weight", "500")
        .style("fill", "#707070")
        .text("0%")



    d3.select(".gameSVG").append("rect")
        .attr("height", 15)
        .attr("width", 15)
        .attr("x", 150)
        .attr("y", 200)
        .attr("fill", "#ef5555")

    d3.select(".gameSVG").append("rect")
        .attr("height", 15)
        .attr("width", 15)
        .attr("x", 150)
        .attr("y", 230)
        .attr("fill", "#d9d678")


    d3.select(".gameSVG").append("rect")
        .attr("height", 15)
        .attr("width", 15)
        .attr("x", 150)
        .attr("y", 260)
        .attr("fill", "#85BC99")


    d3.select(".gameSVG").append("rect")
        .attr("height", 15)
        .attr("width", 15)
        .attr("x", 150)
        .attr("y", 290)
        .attr("fill", "#b7b7b7")



    d3.select(".gameSVG").append("text")
        .style("font-family", "Nunito")
        .style("font-size", "15px")
        .style("fill", "#707070")
        .attr("x", 180)
        .attr("y", 213)
        .text("Infected")

    d3.select(".gameSVG").append("text")
        .style("font-family", "Nunito")
        .style("font-size", "15px")
        .style("fill", "#707070")
        .attr("x", 180)
        .attr("y", 243)
        .text("Quarantined")


    d3.select(".gameSVG").append("text")
        .style("font-family", "Nunito")
        .style("font-size", "15px")
        .style("fill", "#707070")
        .attr("x", 180)
        .attr("y", 273)
        .text("Vaccinated")



    d3.select(".gameSVG").append("text")
        .style("font-family", "Nunito")
        .style("font-size", "15px")
        .style("fill", "#707070")
        .attr("x", 180)
        .attr("y", 303)
        .text("Uninfected")
}

function initScoreRecap() {
    // remove game features from view
    d3.select(".endGameShadow").transition().duration(500).attr("y", -200)
    d3.select(".endGameBox").transition().duration(500).attr("y", -200)
    d3.select(".endGameText").transition().duration(500).attr("y", -200)
    d3.select(".endGameSUBMIT").transition().duration(500).attr("y", -200)
    d3.select("#pinNodesDiv").remove()
    d3.select(".gameSVG").select("g").style("visibility", "hidden")
    hideGameQuarantine();

    var currentScore = Math.round((((countSavedGAME() + numberQuarantined + numberVaccinated)/numberOfIndividuals)*100)).toFixed(0);
    var passed;
    var bar;
    var bestScore;
    var diffset;
    if (difficultyString == "easy") {
        if (speed) {
            diffset = "Easy";
            bestScore = vaxEasyHiScoreRT;
            bar = easyBar;
        }
        else {
            diffset = "Easy";
            bestScore = vaxEasyHiScore;
            bar = easyBar;
        }

    }
    if (difficultyString == "medium") {
        if (speed) {
            diffset = "Medium";
            bestScore = vaxMediumHiScoreRT;
            bar = mediumBar;

        }
        else {
            diffset = "Medium";
            bestScore = vaxMediumHiScore;
            bar = mediumBar;

        }

    }
    if (difficultyString == "hard") {
        if (speed) {
            diffset = "Hard";
            bestScore = vaxHardHiScoreRT;
            bar = hardBar;

        }
        else {
            diffset = "Hard";
            bestScore = vaxHardHiScore;
            bar = hardBar;

        }

    }
    if (difficultyString == null) {
        bestScore = currentScore;
        bar = 0;
    }

    if (currentScore >= bar) passed = true
    else passed = false;



    d3.select(".gameSVG").append("text")
        .attr("class", "networkSizeText")
        .attr("x", -85)
        .attr("y", 90)
        .style("font-size", "40px")
        .text("Network Size: " + numberOfIndividuals);

    generateStackedBarChart();
}

function loadConclusionText() {
    var total = Math.round((((numberSaved + numberQuarantined + numberVaccinated)/numberOfIndividuals)*100)).toFixed(0);


    d3.select(".popup_game_share").style("visibility", "visible")

    d3.select("#pinNodesDiv").remove()

    var bar;
    var bestScore;
    if (difficultyString == "easy") {
        bestScore = vaxEasyHiScore;
        bar = easyBar;
    }
    if (difficultyString == "medium") {
        bestScore = vaxMediumHiScore;
        bar = mediumBar;
    }
    if (difficultyString == "hard") {
        bestScore = vaxHardHiScore;
        bar = hardBar;
    }
    if (difficultyString == null) bestScore = total;

    d3.select(".gameSVG").append("text")
        .attr("class", "bestScore")
        .attr("x", backX + 25)
        .attr("y", 420)
        .style("font-family", "Nunito")
        .style("fill", "#707070")
        .style("font-size", "24px")
        .style("font-weight", "500")
        .text("Best Score: " + bestScore + "%");

    var diffset;

    if (difficultyString == "easy") diffset = "Easy";
    if (difficultyString == "medium") diffset = "Medium";
    if (difficultyString == "hard") diffset = "Hard";
    if (difficultyString == null) {
        diffset = "Custom";
        bestScore = total;
    }

    var twitterText = "https://twitter.com/intent/tweet?original_referer=http%3A%2F%2F.vax.herokuapp.com&text=I just stopped an epidemic in its tracks! Can you can beat " + bestScore + "%25 on " + diffset + "? Fight the outbreak at&url=http%3A%2F%2Fvax.herokuapp.com";
    var facebookText = "http://www.facebook.com/sharer.php?s=100&p[title]=Vax! | Gamifying Epidemic Prevention&p[summary]=I just stopped an epidemic in its tracks! Can you beat " + bestScore + "% on " + diffset + "?&p[url]=http://vax.herokuapp.com";


    d3.select(".gameSVG").append("image")
        .attr("x", 150)
        .attr("y", 355)
        .attr("height", "50px")
        .attr("width", "50px")
        .attr("xlink:href", "/assets/facebook_icon.png")
        .attr("id", "facebook")
        .style("padding", "12px 7px 0px 7px")
        .style("cursor", "pointer")
        .on("click", function() {
            window.location.href = facebookText;
        })

    d3.select(".gameSVG").append("image")
        .attr("x", 215)
        .attr("y", 355)
        .attr("height", "50px")
        .attr("width", "50px")
        .attr("xlink:href", "/assets/twitter_icon.png")
        .attr("id", "twitter")
        .style("padding", "12px 7px 0px 7px")
        .style("width", "25px")
        .style("cursor", "pointer")
        .on("click", function() {
            window.location.href = twitterText;
        })

    d3.select(".gameSVG").append("image")
        .attr("x", 280)
        .attr("y", 355)
        .attr("height", "50px")
        .attr("width", "50px")
        .attr("xlink:href", "/assets/googleplus_icon.png")
        .attr("id", "twitter")
        .style("padding", "12px 7px 0px 7px")
        .style("width", "25px")
        .style("cursor", "pointer")
        .on("click", function() {
            window.location.href = "https://plus.google.com/share?url=http://vax.herokuapp.com";
        })


    if (difficultyString == null) {
        d3.select(".gameSVG").append("text")
            .attr("class", "recapText")
            .attr("x", 260)
            .attr("y", 525)
            .text("Well done, you saved " + total + "% of the network.")

        d3.select(".gameSVG").append("text")
            .attr("class", "recapButton")
            .attr("x", 470)
            .attr("y", 590)
            .text("Retry")
            .on("click", retry)
            .on("mouseover", function() {
                d3.select(this).style("fill", "#2692F2")
            })
            .on("mouseout", function() {
                d3.select(this).style("fill", "#707070")
            })

    }
    else {
        if (total > bar) {
            d3.select(".gameSVG").append("text")
                .attr("class", "recapText")
                .attr("x", 260)
                .attr("y", 525)
                .text("Well done, you saved " + total + "% of the network.")

            d3.select(".gameSVG").append("text")
                .attr("class", "recapButton")
                .attr("x", 355)
                .attr("y", 590)
                .text("Retry")
                .on("click", retry)
                .on("mouseover", function() {
                    d3.select(this).style("fill", "#2692F2")
                })
                .on("mouseout", function() {
                    d3.select(this).style("fill", "#707070")
                })


            d3.select(".gameSVG").append("text")
                .attr("class", "recapButton")
                .attr("x", 580)
                .attr("y", 590)
                .text("Next")
                .on("click", next)
                .on("mouseover", function() {
                    d3.select(this).style("fill", "#2692F2")
                })
                .on("mouseout", function() {
                    d3.select(this).style("fill", "#707070")
                })

        }
        else {
            d3.select(".gameSVG").append("text")
                .attr("class", "recapText")
                .attr("x", 200)
                .attr("y", 525)
                .text("Save " + bar + "% of the network to unlock the next stage.")

            d3.select(".gameSVG").append("text")
                .attr("class", "recapButton")
                .attr("x", 470)
                .attr("y", 590)
                .text("Retry")
                .on("click", retry)
                .on("mouseover", function() {
                    d3.select(this).style("fill", "#2692F2")
                })
                .on("mouseout", function() {
                    d3.select(this).style("fill", "#707070")
                })
        }
    }
}

function retry() {
    d3.select(".gameSVG").remove()
    graph = {};
    timestep = 0;
    diseaseIsSpreading = false;
    timeToStop = false;

    if (difficultyString == null) initCustomGame();
    else initBasicGame(difficultyString);

}

function next() {
    d3.select(".gameSVG").remove()
    graph = {};
    timestep = 0;
    diseaseIsSpreading = false;
    timeToStop = false;
    hideGameQuarantine();

    if (difficultyString == "hard" || difficultyString == null) {
        window.location.href = "/game"

    }
    else {
        if (difficultyString == "easy") {
            difficultyString = "medium";
            initBasicGame("medium")
            return;
        }
        if (difficultyString == "medium") {
            difficultyString = "hard";
            initBasicGame("hard");
            return;
        }
    }

}

function toggleDegreeFxn() {
    toggleDegree = !toggleDegree;

    if (toggleDegree && difficultyString == "easy") charge = -900;
    if (toggleDegree && difficultyString == "medium") charge = -700;
    if (toggleDegree && difficultyString == "hard") charge = -600;

    if (!toggleDegree) charge = -300;

    gameUpdate();

}

function getCartesianDistance(originalLocation, newLocation) {
    var x1 = originalLocation[0];
    var y1 = originalLocation[1];
    var x2 = newLocation[0];
    var y2 = newLocation[1];
    var squaredDeltaX = Math.pow(x1 - x2, 2)
    var squaredDeltaY = Math.pow(y1 - y2, 2)
    return Math.pow(squaredDeltaX + squaredDeltaY, 0.5)
}
