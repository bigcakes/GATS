function Individual(alleleCount,maxAllele,minAllele, extraAlleles) 
{
	this.alleleCount = alleleCount;
	this.alleles = [];
	this.extraAlleles = extraAlleles;

	for (var i = 0; i < this.alleleCount + this.extraAlleles; i++) {
		this.alleles.push(Math.floor(Math.random()*maxAllele)+minAllele);
	};
	
}

Individual.prototype.calcValue = function(valueArr)
{
	var value = 0;
	var seenAlleles = "";
	var startAt = 1;
	//Add code for making extra allele values count if not unique ones found
	for(var i=1;i<this.alleleCount;i++)
	{
		seenAlleles += this.alleles[startAt-1];


		if (seenAlleles.indexOf(this.alleles[i].toString()) == -1)
		{
			value += cityArray[this.alleles[i].toString() + this.alleles[seenAlleles.length-1].toString()];
		}
		else
		{
			var found = false;

			for(;startAt<this.alleleCount+ this.extraAlleles;startAt++)
			{
				if (seenAlleles.indexOf(this.alleles[startAt].toString()) == -1)
				{
					value += cityArray[this.alleles[startAt].toString() + seenAlleles[seenAlleles.length-1]];//this.alleles[i-1].toString()];
					found = true;
					break;
				}
			}

			if(!found)
				return wrongRoute;
		}
		startAt += 1;
	}

	if (seenAlleles.length < this.alleleCount - 1)
		return wrongRoute;
	return value;
}

Individual.prototype.setAlleles = function(alleles)
{
	this.alleles = [];
	this.alleles = alleles;
}

Individual.prototype.getAlleleAt = function(index)
{
	return this.alleles[index];
}

Individual.prototype.getAlleles = function()
{
	return this.alleles;
}



//*************************************************************************


function Population(size, elitists, alleleCount, alleleMin, alleleMax, extraAlleles, mutationProb)
{
	this.popSize = size;
	this.alleleCount = alleleCount;
	this.elitists = elitists;
	this.individuals = [];
	this.newIndiv = [];
	this.weights = [];
	this.alleleMin = alleleMin;
	this.alleleMax = alleleMax;
	this.lowest = -1;
	this.highest = -1;
	this.extraAlleles = extraAlleles;
	this.mutationProb = mutationProb;

	for (i=0;i<this.popSize;i++)
	{
		this.individuals.push(new Individual(this.alleleCount, this.alleleMax,this.alleleMin, this.extraAlleles));
	}

}


Population.prototype.evolve = function()
{
	this.newIndiv = [];
	this.weights = [];
	this.individuals.sort(function(a,b){return a.calcValue() - b.calcValue()}); //Sort the array in descending order

	var max = this.individuals[this.popSize - 1].calcValue() + 1;
	var total = this.getTotalVal();
	var totalWeightSoFar = 0;

	for(var i=0;i<this.popSize;i++) //Add all weights to the array
	{
		var indivWeight = this.individuals[i].calcValue();
		var weightToPush = ((max - indivWeight)/total);
		this.weights.push(totalWeightSoFar + weightToPush);
		totalWeightSoFar += weightToPush;
	}


	for(var i =0;i<this.elitists;i++)
	{
		this.newIndiv.push(this.individuals[i]);
	}

	for(var i=0;i<this.popSize - this.elitists;i++)
	{
		//Instead of making the max random 1 for 100%, I had to make it the max 
		//percent in weights, as I think there was a JS rounding issue, as my top
		//weight was only 89% or so.
		var firstIndex = this.getIndivAtPercent(Math.random()*this.weights[this.weights.length - 1]);
		var secondIndex = this.getIndivAtPercent(Math.random()*this.weights[this.weights.length - 1]);
		firstParent = this.individuals[firstIndex];
		secondParent = this.individuals[secondIndex];


		this.newIndiv.push(this.breed(firstParent,secondParent));


	}

	this.individuals = [];
	this.individuals = this.newIndiv;
}

Population.prototype.getStats = function()
{
	var lowestStr = "";
	var highestStr = "";

	var lowest = this.getLowest();

	var highest = this.getHighest();

	if (this.lowest == -1 || lowest.calcValue() < this.lowest.calcValue())
	{
		this.lowest = lowest;
		lowestStr = "*";
	}

	if (this.highest == -1 || highest.calcValue() > this.highest.calcValue())
	{
		this.highest = highest;
		highestStr = "*";
	}
	var statString = "Lowest Value: " + lowest.calcValue() + lowestStr + " Highest Value: " + highest.calcValue() + highestStr
					+ " Average Value: " + this.getAverage() + " Best Individual: " + lowest.getAlleles();

	return statString;
}

Population.prototype.getTotalVal = function()
{
	var total = 0;

	for(var i=0;i<this.popSize;i++)
	{
		total += this.individuals[i].calcValue();
	}

	return total;
}

Population.prototype.getIndivAtPercent = function(percent)
{
	for(var i = 0;i<this.weights.length;i++)
	{
		if (percent<this.weights[i])
			return i;
	}
	//Had to make the max random value the top percent, as I was getting like 89% total, due to I believe rounding errors in JS, so a random above that gave an undefined parent
	return -1;
}

Population.prototype.breed = function(firstParent,secondParent)
{
	var newAlleles = [];
	for(var i=0;i<this.alleleCount + this.extraAlleles;i++)
	{
		var mutate = Math.floor(Math.random()*100);
		if (mutate < this.mutationProb)
		{
			newAlleles.push(Math.floor(Math.random()*this.alleleMax)+this.alleleMin);
		}
		else
		{
			var headTails = Math.random()*101;

			if (headTails < 50)
			{
				newAlleles.push(firstParent.getAlleleAt(i));
			}
			else
			{
				newAlleles.push(secondParent.getAlleleAt(i));
			}
		}
	}

	var newIndividual = new Individual(this.alleleCount, this.alleleMax,this.alleleMin);
	newIndividual.setAlleles(newAlleles);

	return newIndividual;
}


Population.prototype.getLowest = function()
{
	var lowest = this.individuals[0];

	for(var i=0;i<this.popSize;i++)
	{
		var thisLow = this.individuals[i].calcValue();
		if (lowest.calcValue() > thisLow)
			lowest = this.individuals[i];
	}

	return lowest;
}

Population.prototype.getHighest = function()
{
	var highest = this.individuals[0];

	for(var i=0;i<this.popSize;i++)
	{
		if (highest.calcValue() < this.individuals[i].calcValue())
			highest = this.individuals[i];
	}

	return highest;
}

Population.prototype.getAverage = function()
{
	var total = 0;

	for(var i=0;i<this.popSize;i++)
	{
		total += this.individuals[i].calcValue();
	}

	return total/this.individuals.length;
}




//*************************************************************************




//City 1: Flint
//City 2: Saginaw
//City 3: Marlette
//City 4: Royal Oak
//City 5: Troy
//City 6: Pontiac
//City 7: Grand Rapids

//If the found distance is 0, then skip it and go to the next combination
var cityArray = {"11":1000000,"12":37,"21":37,"13":55,"31":55,"14":57,"41":57,
					"15":48,"51":48, "16":36,"61":36,"17":114,"71":114, 
					"22":1000000,"23":50,"32":50,"24":91,"42":91,"25":82,"52":82,
					"26":70,"62":70,"27":132,"72":132,"33":1000000,"34":67,"43":67,
					"35":59,"53":59,"36":65,"63":65,"37":168,"73":168,"44":1000000,
					"45":8,"54":8,"46":19,"64":19,"47":148,"74":148,"55":1000000,
					"56":12,"65":12,"57":157,"75":157,"66":1000000,"67":152,"76":152,
					"77":1000000};

$(document).ready(function() {
	var json = JSON.stringify(cityArray);
	$("#cityArray").val(json);


});



var finished = true;

var wrongRoute = 2000;



function startGA()
{
	if (finished)
	{
		//Do error checking/setting on submit later
		finished = false;

		var popSize = 200;
		var generations = 500;
		var elitists = 2;
		var alleles = 7;
		var minAllele = 1;
		var maxAllele = 7;
		var extraAlleles = 2;
		var mutationProb = 20;
		var statFreq = 10;
		wrongRoute = 2000;
		//Decent starting result = 100,100,2,7,1,7,2,20,10,2000
		//If take out elitists, fun resutls of fluctuating lowest
		popSize = parseInt($("input[name=popSize]").val());
		generations = parseInt($("input[name=generations]").val());
		elitists = parseInt($("input[name=elitists]").val());
		alleles = parseInt($("input[name=alleles]").val());
		minAllele = parseInt($("input[name=minAllele]").val());
		maxAllele = parseInt($("input[name=maxAllele]").val());
		extraAlleles = parseInt($("input[name=extraAlleles]").val());
		mutationProb = parseInt($("input[name=mutationProb]").val());
		statFreq = parseInt($("input[name=statFreq]").val());
		wrongRoute = parseInt($("input[name=wrongRoute]").val());
		cityArray = JSON.parse($("#cityArray").val());

		//popSize, elitists, alleles, min allele, max allele, extra alleles, mutation prob (lower is more frequent)
		var populationObj = new Population(popSize,elitists,alleles,minAllele,maxAllele,extraAlleles,mutationProb);
		//Seems like the more likely a mutation is, the better end solution is come up, here is a good setup:new Population(100,2,7,1,7,3,5).

		//https://maps.google.com/maps?saddr=grand+rapids,+mi&daddr=flint,+mi+to:saginaw,+mi+to:marlette,+mi+to:pontiac,+mi+to:troy,+mi+to:royal+oak,+mi&hl=en&ll=43.185153,-84.094849&spn=3.468543,3.12561&sll=42.835696,-82.8479&sspn=6.976182,6.251221&geocode=FaCRjwIdCs_k-ikVKFC7YFQYiDHQqNMby6qTpQ%3BFa9RkAId4AcD-ykXc5el-3gjiDFraDOOCTqFwQ%3BFU6HlgIdKQP_-imvWOeGQcIjiDGs9a57bZTjKQ%3BFfgdlQId5EsM-yn3S2P8NzEkiDFDK22v3yi_Fw%3BFUqeigIdWRQJ-ylTXySTyb8kiDEKO-l09TJ5Ew%3BFRUcigIdljsL-ykTzIsxCsQkiDGnd5F-xgBLtA%3BFYhWiAIdOFAL-yn3K81s-cUkiDEQM8rvQdMPBw&t=h&mra=ls&z=8
		//284 min (I think 286 in my program due to rounding)


		
		$(document).ready(function() {

		$("#stats").html('');
		$("#stats").append("<p>"+ "Every "+ statFreq +" generations (* means new lowest or highest)" +"</p>");

		var stats = populationObj.getStats();
		$("#stats").append("<p>Generation: "+ (1) + " " + stats +"</p>");
		

		for (var i = 0; i < generations; i++) 
		{
			try
			{
				populationObj.evolve();
				
				if((i+1)%statFreq==0)
				{
					var stats = populationObj.getStats();
					$("#stats").append("<p>Generation: "+ (i + 1) + " " + stats +"</p>");
				}	
			}
			catch (ex)
			{
				console.log("Error occurred.  Exception: " + ex);
			}
			
		}

		finished = true;

		});
	}
}