/*
强化学习 QLearning 的一个实现

作者：Wyatt Zheng
邮箱：yuxon@qq.com

 */

class Env{
	/*
		环境,可以被继承
		actions代表可行的动作空间,是一个数组

	*/
	constructor(actions){
		this.actions=actions;
	}
	getActionLength(){
		return this.actions.length;
	}
	doAction(agent,act_index){
		let actname=this.actions[act_index];

		this.do(actname,agent);
	}
	doAndGetReward(agent,act_index){
		this.doAction(agent,act_index);
		let info=this.step(agent);
		return info;
	}


}

class Observer{
	//环境的观察者,提供部分环境的信息

	constructor(substates){
		this.substates=substates;//所有可以被观察者看到的子状态

		/*
			3个子状态就可以形成总共2^3=8种状态的状态空间
		 */
	}
	setEnv(env){
		this.env=env;
	}
	getStateLength(){//获取总共有多少种状态
		return Math.pow(2,this.substates);
	}
	getState(agent){//获取最新观察到的状态
		let states="";

		let sts=this.env.getstate(agent);

		for(let i=0;i<this.substates;i++){
			states+=sts[i]?"1":"0";
		}
		return parseInt(states,2);//通过二进制获取这是第几种状态
	}
}

class Agent{
	constructor(env,substates,learning_rate,discount_rate){
		this.env=env;
		this.observer=new Observer(substates);
		this.observer.setEnv(env);

		this.qtable=[];
		this.setupQtable();

		this.learning_rate=learning_rate;
		this.discount_rate=discount_rate;
		
		this.reward=0;
	}
	setupQtable(){
		let qtable=[];
		for(let s=0;s<this.observer.getStateLength();s++)
		{	
			qtable[s]=[];
			for(let a=0;a<this.env.getActionLength();a++){
				qtable[s][a]=0;
			}
		}
		this.qtable=qtable;
	}
	getBestAction(){//策略函数,暂时用最好的
		let epson=0.1;

		let s=this.observer.getState(this);

		let acts=this.qtable[s].concat([]).map((x,key)=>({key,value:x}));
		acts.sort((a,b)=>(b.value-a.value));

	
		if(Math.random()<epson || acts[0].value == 0){
			let key=Math.floor(Math.random()*this.qtable[s].length);
			return acts[key].key;
		}else{
			return acts[0].key;
		}

	}
	getHistoryBestQ(s){//该状态下，q值最大的动作的q值
	
		let acts=this.qtable[s].concat([]);
		acts.sort((a,b)=>(b-a));

		return acts[0];
	}
	step(){
		let act_index=this.getBestAction();
	
		let state=this.observer.getState(this);
		let Q=this.qtable[state][act_index];


		let {stage,reward}=this.env.doAndGetReward(this,act_index);
		let newstate=this.observer.getState(this);


		let value=(1-this.learning_rate)*Q+this.learning_rate*(reward+this.discount_rate*this.getHistoryBestQ(newstate));
		//QTable 价值更新

		this.qtable[state][act_index]=value;

		if(stage){
			this.reward=reward;
		//	console.log(this.reward);
		}
		return stage;
	}

}



class FoodPlane extends Env{
	constructor(){
		super([]);
		for(let i=0;i<10;i++)
			this.actions.push(i);	//总共5格食物
		

		this.foods={};
		this.steps=0;
	}
	get(act){

		return this.foods[act]?true:false;
	}
	do(act){
		this.foods[act]=true;
	}

	reset(){
		this.foods={};
	}
	step(agent){
		let rewards=0;

		for(let i=0;i<10;i++){
			if(this.foods[i])rewards++;			
		}

		let stage=false;
		this.steps++;
		if(this.steps>=100){
			this.steps=0;
			stage=true;
			this.reset();
		}

		return {stage,reward:rewards};
	}
}
/*
let plane=new FoodPlane();
let agent=new Agent(plane,["1","2","3","4","5"],0.5,0.1);


for(let i=0;i<10000;i++){
	agent.step();
}*/

module.exports={Env,Agent};