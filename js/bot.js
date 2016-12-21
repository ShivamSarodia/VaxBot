// If true, then repeat() waits a small time between clicks to allow seeing the clicks.
var runSlow = false;

// Run the given strategy for the given number of trials and set the run_results variable.
function run(strategy, trials = 1) {
    if(runSlow) {
	if(trials > 0) console.warn("Multiple trials not permitted with runSlow.")

	strategy();
    } else {
	run_results = []
	while(trials) {
	    console.log("Trial: " + trials);

	    retry();
	    strategy();
	    if(!timeToStop) console.warn("Strategy did not complete game.");

	    var saved = 0;
	    for(var i = 0; i < graph.nodes.length; i++) {
		if(graph.nodes[i].status != "I") saved += 1;
	    }
	    run_results.push(saved);

	    trials--;
	}

	return run_results;
    }
}

Analysis = {
    // Return mean of the given array
    mean: function(results) {
	return results.reduce(function(a, b) { return a + b; }, 0) / results.length;
    },

    // Return standard deviation of given array
    sd: function(results) {
	var mean = Analysis.mean(results);
	return Math.sqrt(results
			 .map(function(a) { return (a - mean)*(a - mean)/(results.length-1) })
			 .reduce(function(a, b) { return a + b; }, 0));
    },

    // Return t-value that res1 has higher population mean than res2
    t_test: function(res1, res2) {
	var se = Math.sqrt(Analysis.sd(res1)**2 / res1.length + Analysis.sd(res2)**2 / res2.length);
	return (Analysis.mean(res1) - Analysis.mean(res2)) / se;
    },

    // Print summary statistics about the given array to console
    print: function(results) {
	var mean = Analysis.mean(results);
	var sd = Analysis.sd(results);

	console.log("Mean: ", mean);
	console.log("SD: ", sd);
	console.log("Range: " + Math.round((mean - sd / Math.sqrt(run_results.length))*10)/10 + " to " +
		    Math.round((mean + sd / Math.sqrt(run_results.length))*10)/10);
    }
}

// Accepts a function, which is called repeatedly until the game is over. When
// runSlow is false, repeats the function in a while-loop. When runSlow is true,
// repeats the function with a pause in between to show steps.
function repeat(click, delay=1000) {
    if(!runSlow) {
	while(!timeToStop) click();
    } else {
	var interval = setInterval(function() {
	    click();
	    if(timeToStop) clearInterval(interval);
	}, delay);
    }
}

// Repeatedly select a random node to eliminate until the game is over.
// Easy: 18.57 - 18.3 to 18.8
function random_node() {
    repeat(function() {
	while(!gameClick(graph.nodes[Math.floor(Math.random()*50)]));
    });
}

// Runs the vaccination phase by repeatedly selecting the node with highest
// degree to vaccinate.
function vac_by_degree() {
    function deg(node) { return findNeighbors(node).length; }

    // During vaccination phase, pick node with highest degree
    while(numberOfVaccines > 0) {
	var max_deg = -1;
	var max_deg_index = -1;
	for(var i = 0; i < graph.nodes.length; i++) {
	    n = deg(graph.nodes[i])
	    if(graph.nodes[i].status == "S" && n > max_deg) {
		max_deg = n;
		max_deg_index = i;
	    }
	}
	gameClick(graph.nodes[max_deg_index])
    }
}

// Easy: 24.74 - 24.1 to 25.3
function random_qtine() {
    vac_by_degree();
    random_node();
}

// Quarantines based on a linear combination of sick degree and total
// degree. The parameter k determines the weighting of total degree in this
// calculation.

// k = 0   =>   22.78  (21.9 to 23.7)
function quarantine_nearby(k = 0) {
    function deg(node) { return findNeighbors(node).length; }
    function sick_deg(node) {
	return findNeighbors(node)
	    .filter(function(n) { return n.status == "I"; })
	    .length
    }

    repeat(function() {
	var max_deg = -1;
	var max_deg_index = -1;
	for(var i = 0; i < graph.nodes.length; i++) {
	    n = sick_deg(graph.nodes[i]) + k * deg(graph.nodes[i]);
	    if(graph.nodes[i].status == "S" && n > max_deg) {
		max_deg = n;
		max_deg_index = i;
	    }
	}
	gameClick(graph.nodes[max_deg_index])
    }, 1500);
}

// Easy: 37.55 (36.7 to 38.4)
function nearby_sick() {
    vac_by_degree();
    quarantine_nearby(0);
}

// Easy: 39.47 (38.7 to 40.2)
function nearby_sick_deg_0p001() {
    vac_by_degree();
    quarantine_nearby(0.001);
}

// Easy: 40.96 (40.4 to 41.5)
function nearby_sick_deg_0p5() {
    vac_by_degree();
    quarantine_nearby(0.5);
}


// Easy: 34.64 (34.1 to 35.2)
function nearby_sick_deg_1() {
    vac_by_degree();
    quarantine_nearby(1);
}
