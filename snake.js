let {Env,Agent}=require("./qlearning.js");

class SnakePlane extends Env{
	constructor(){
		super(["up","down","right","left"]);

		this.region={x:20,y:20};

		this.apples=[];
		this.apple_length=1;

	}
	do(act){
		this.snake[act]();
	}
	getstate(agent){
		let states=[];
		for(let i=0;i<20;i++)
			states.push(0);

		
		let x=this.snake.getHead().x;
		let y=this.snake.getHead().y;
		let ax=this.apples[0].x;
		let ay=this.apples[0].y;


		let ss=[
			this.snake.direction==1,
			this.snake.direction==2,
			this.snake.direction==3,
			this.snake.direction==4,
			x<=ax,
			x>=ax,
			y<=ay,
			y>=ay,
		];
		

		for(let i in ss){
			states[i]=ss[i]?1:0;
		}


		return states;

	}
	onAppleAte(){

	}
	reset(){
		this.snake=new Snake(Math.floor(this.region.x/2),Math.floor(this.region.y/2));
		this.apples=[];
		this.genApples();

	}
	render(){
		let set={};
		let appleset={};

		this.snake.body.map((b)=>{
			set[`${b.x}-${b.y}`]=true;
		})
		this.apples.map((b)=>{
			appleset[`${b.x}-${b.y}`]=true;
		})
		
	//	console.log(set);

		let pic="";
		for(let wy=0;wy<this.region.y;wy++)
		{	

			let y=this.region.y-wy-1;

			pic+="|"
			for(let x=0;x<this.region.x;x++)
				if(set[`${x}-${y}`]){
					pic+="X";
				}else if(appleset[`${x}-${y}`]){
					pic+="O";
				}else{
					pic+=" "
				}
			pic+="|\r\n";

		}
		pic+="|"
		for(let x=0;x<this.region.x;x++){
			pic+="=";
		}
		pic+="|"
		console.log(pic);
	}
	step(){

		let reward=0;

		this.snake.move();
		this.checkCrash();
		reward+=this.checkApple()?1000:0;
	

		this.genApples();

		let stage=false;
		if(this.snake.dead){
			reward=-100;
			this.reset();
			stage=true;
		}

		return {reward,stage};
	}
	genApples(){
		let offset=this.apple_length-this.apples.length;
		if(offset>0){
			for(let i=0;i<offset;i++){
				let x=Math.floor(Math.random()*this.region.x);
				let y=Math.floor(Math.random()*this.region.y);
				
				this.apples.push({x,y});

			}
		}
	}
	checkApple(){
		let head=this.snake.getHead();		

		for(let i in this.apples){
			let apple=this.apples[i];
			if(apple.x==head.x && apple.y==head.y){
				this.apples.splice(i,1);
				this.snake.appendBody();
				this.onAppleAte();
				return true;
			}

		}
		return false;
	}
	checkCrash(){
		let head=this.snake.getHead();		


		if(head.x>this.region.x){
			this.snake.dead=true;
		}
		if(head.x<0){
			this.snake.dead=true;
		}
		if(head.y>this.region.y){
			this.snake.dead=true;
		}
		if(head.y<0){
			this.snake.dead=true;
		}
	}
}

class Snake{
	constructor(x,y,direction){
		this.body=[];

		this.initbody(x,y);

		this.dead=false;
		this.direction=direction || 3;//总共有四个方向,0=上,1=左,2=下,3=右
	}
	initbody(x,y){
		for(let i=0;i<5;i++){
			this.addBody(x-i,y);
		}
	}
	up(){
		if(this.direction!=2)
			this.direction=0;
	}
	left(){
		if(this.direction!=3)
			this.direction=1;
	}
	down(){
		if(this.direction!=0)
			this.direction=2;
	}
	right(){
		if(this.direction!=1)
			this.direction=3;
	}

	getHead(){
		return this.body[0];
	}
	addBody(x,y){
		this.body.push({x,y});
	}
	appendBody(){
		let tail=this.body[this.body.length-1];
		let tail2=this.body[this.body.length-2];

		let dx=tail.x-tail2.x;
		let dy=tail.y-tail2.y;

		let newbody={x:tail.x+dx,y:tail.y+dy};
		this.body.push(newbody);
	}
	checkEatSelf(){
		let head=this.getHead();
		for(let i=1;i<this.body.length;i++){
			let b=this.body[i];
	
			if(b.x==head.x && b.y==head.y)
				this.dead=true;
			
		}
	}
	move(){
		if(this.dead)return;

		let newhead={x:this.getHead().x,y:this.getHead().y};

		if(this.direction==0)
			newhead.y+=1;
		else if(this.direction==1)
			newhead.x-=1;
		else if(this.direction==2)
			newhead.y-=1;
		else if(this.direction==3)
			newhead.x+=1;
	
			this.body.unshift(newhead);
			this.body.pop();


		//this.checkEatSelf();
		//解除注释这行可以启动吃自己死亡的判断

	}
}
/*
let p=new SnakePlane();
p.reset();

setInterval(()=>{
	//	p.snake.up();

//	console.log(p.snake.direction)

	p.step();
	p.render();
},500);


process.stdin.on("data",(data)=>{
	let str=data+"";
	if(str.indexOf("A")>=0){
		p.snake.left();
	}else if(str.indexOf("D")>=0){
		p.snake.right();
	}else if(str.indexOf("W")>=0){
		p.snake.up();
	}else if(str.indexOf("S")>=0){
		p.snake.down();
	}
})*/

let plane=new SnakePlane();
plane.reset();

let agent=new Agent(plane,8,0.1,0.2);//第二个参数是子状态数量，第三个参数是学习率，第四个参数是折扣率
for(let i=0;i<200000;i++)//训练二十万次
	agent.step();

console.log(agent.qtable);//训练迭代完毕的QTable

setInterval(()=>{
	agent.step();
	plane.render();
},100);
		

