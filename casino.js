"use strict";

$(document).ready(function(){
    new SimpleSlotMachine();
});

class SimpleSlotMachine {

	constructor(){
		this.init();
		this.setupOnClicks();
		this.getResult();
	}

	init(){
		this.hash = '';
		this.currentBet = 1;
		this.currentLines = 1;
		this.currentTotal = 1;
		this.currentCredit = 900;
		this.result = 'Click Start to Spin';
		this.autoSpin = false;
		this.totalWin = 0;
		this.winFields = [];
		this.imgDir = 'img';
	}

	setupOnClicks(){
		$(document).on('click', '.auto-start', this.automatic.bind(this));
		$(document).on('click', '.bet-one', this.betOne.bind(this));
		$(document).on('click', '.bet-max', this.betMax.bind(this));
		$(document).on('click', '.lines-one', this.linesOne.bind(this));
		$(document).on('click', '.lines-max', this.linesMax.bind(this));
		$(document).on('click', '.spin', this.spin.bind(this));
	}

	getResult() {
		this.getInfoDisplay();
		$('#result').text(this.result);
		return this.result;
	}

	getInfoDisplay() {
		let msg = 'bet: ' + this.currentBet +
			' | lines: ' + this.currentLines +
			' | total bet: ' + this.currentTotal +
			' | credit:' + this.currentCredit;
		$('#info-panel').text(msg);
		console.log(msg);
	}

	updateDisplay(){
		$('.display-field .img-responsive').each(
			(index,element) => {
				$(element).css('border', '2px #eee solid');
				$(element).attr('src', this.imgDir + '/' + this.hash[index] + '.png');
				if(this.winFields.includes(index)){
					$(element).css('border', '2px #ff0000 solid');
				}
			});
	}

	updateWins(){
		let vectors = new WinLineVectors(this.hash);
		let wins = vectors.getWins(this.currentLines);
		if(wins){
			this.winFields = vectors.winFields;
			this.totalWin = wins * this.currentBet;
			this.currentCredit += this.totalWin;
			this.result = 'WIN ' + this.totalWin;
			this.getSound('win');
			return true;
		}
		return false;
	}

	getSound(action){
		let sound = null;
		switch(action) {
			case 'stop':
				sound = new Audio('sound/1.mp3');
				break;
			case 'win':
				sound = new Audio('sound/2.mp3');
				break;
			default:
				sound = new Audio('sound/0.mp3');
		}
		if(sound){
			sound.play();
		}
		else{
			console.log('[NoSoundAudioHtml5]');
		}
	}

	// slot machine basic operations
	betOne(){
		this.currentBet = (this.currentBet % 10) + 1;
		this.setTotalBet();
		this.getInfoDisplay();
		return this.currentBet;
	}
	betMax(){
		this.currentBet = 10;
		this.setTotalBet();
		this.getInfoDisplay();
		return this.currentBet;
	}
	setTotalBet(){
		return this.currentTotal = this.currentBet * this.currentLines;
	}
	linesOne(){
		this.currentLines = (this.currentLines % 9) + 1;
		this.setTotalBet();
		this.getInfoDisplay();
		return this.currentLines;
	}
	linesMax(){
		this.currentLines = 9;
		this.setTotalBet();
		this.getInfoDisplay();
		return this.currentLines;
	}
	static getDemoHash(len){
		let salt = '';
		if(!len) len = 100;
		for(let i=0;i<len;i++){
			salt += String.fromCharCode(48 + Math.floor(Math.random()*42));
		}
		return md5(salt);
	}
	getSpin(){
		this.hash = SimpleSlotMachine.getDemoHash(100);
		this.getSound();
		this.updateWins();
		this.updateDisplay();
		this.getResult();
		this.getSound('stop');
	}
	spin(){
		this.winFields = [];
		if(!this.availableFunds()) {
			this.autoSpin = false;
			this.result = 'Game Over';
		}
		else {
			this.totalWin = 0;
			this.result = 'You Lose';
			this.getSpin();
			this.currentCredit -= this.currentTotal;
		}
		this.getResult();
		if(this.autoSpin) this.automatic();
	}
	automatic(){
		this.autoSpin = true;
		setTimeout(this.spin.bind(this), 1500);
	}
	availableFunds(){
		return ((this.currentCredit - this.currentTotal) >= 0);
	}

};

class WinLineVectors {

	constructor(hash){

		this.hash = hash;

		this.indexTable = [
			[0,1,2,3,4],
			[5,6,7,8,9],
			[10,11,12,13,14],
			[0,6,12,8,4],
			[10,6,2,8,14],
			[0,6,7,8,4],
			[10,6,7,8,14],
			[0,11,2,13,4],
			[10,1,12,3,14]
		];

		this.winFields = [];
	}

	getWins(currentLines){
		let winAmount = 0;
		for(let i=1;i<=currentLines;i++){
			let vector = this.indexTable[(i-1)];
			let count = this.getWinCountVector(vector);
			if(count){
				for(let z=0;z<count;z++){
					this.winFields.push(vector[z]);
				}
			}
			winAmount += count;
		}
		this.winFields = [...new Set(this.winFields)]; // make unique
		return winAmount;
	}

	getWinCountVector(vector){

		if(
			this.hash[vector[0]] == this.hash[vector[1]] &&
			this.hash[vector[1]] == this.hash[vector[2]] &&
			this.hash[vector[2]] == this.hash[vector[3]] &&
			this.hash[vector[3]] == this.hash[vector[4]]
		) return 5;

		if(
			this.hash[vector[0]] == this.hash[vector[1]] &&
			this.hash[vector[1]] == this.hash[vector[2]] &&
			this.hash[vector[2]] == this.hash[vector[3]]
		) return 4;

		if(
			this.hash[vector[0]] == this.hash[vector[1]] &&
			this.hash[vector[1]] == this.hash[vector[2]]
		) return 3;

		if(
			this.hash[vector[0]] == this.hash[vector[1]]
		) return 2;

		return 0;

	}

};