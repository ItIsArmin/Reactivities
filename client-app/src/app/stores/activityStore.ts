import { makeAutoObservable, runInAction } from "mobx"
import agent from "../api/agent";
import { Activity } from "../models/activity";
import { v4 as uuid } from "uuid";

export default class ActivityStore {
    // activities : Activity[] = [];
    activityRegistery = new Map<string, Activity>();
    selectedActivity : Activity | undefined = undefined;
    editMode : boolean = false;
    loading : boolean = false;
    loadingInitial : boolean = true;

    constructor() {

        makeAutoObservable(this);

    }

    
    public get activityByDate() : Activity[] {
        return Array.from(this.activityRegistery.values()).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }
    

    loadActivities = async () => {
        this.loadingInitial = true;
        try {
            const activities = await agent.Activities.list();
            activities.forEach((activity => {
                this.setActivity(activity);
              }));
            this.setLoadingInitial(false);
        } catch (error) {
            console.log(error);
            this.setLoadingInitial(false);
        }
    }

    loadActivity = async (id:string) => {
        let activity = this.getActivity(id);
        if (activity) {
            this.selectedActivity = activity;
            return activity;
        } else {
            this.setLoadingInitial(true);
            try {
                activity = await agent.Activities.details(id);
                this.setActivity(activity);
                runInAction(() => {
                    this.selectedActivity = activity;
                });
                this.setLoadingInitial(false);
                return activity;
            } catch (error) {
                console.log(error);
                this.setLoadingInitial(false);
            }
        }
    }

    private setActivity = (activity : Activity) => {
        activity.date = activity.date.split('T')[0];
        // this.activities.push(activity);
        this.activityRegistery.set(activity.id,activity);
    }
    
    private getActivity = (id:string) => {
        return this.activityRegistery.get(id);
    }

    setLoadingInitial = (state:boolean) => {
        this.loadingInitial = state;
    }

    // selectActivity = (id: string) => {
    //     // this.selectedActivity = this.activities.find(a => a.id === id);
    //     this.selectedActivity = this.activityRegistery.get(id);
    // }

    // cancelSelectedActivity = () => {
    //     this.selectedActivity = undefined;
    // }

    // openForm = (id?: string) => {
    //     id? this.selectActivity(id) : this.cancelSelectedActivity();
    //     this.editMode = true;
    // }

    // closeForm = () => {
    //     this.editMode = false;
    // }

    createActivity = async (activity : Activity) => {
        this.loading = true;
        activity.id = uuid();
        try {
            await agent.Activities.create(activity);
            runInAction(() => {
                // this.activities.push(activity);
                this.activityRegistery.set(activity.id,activity)
                this.selectedActivity = activity;
                this.editMode = false;
                this.loading = false;
            })
            return activity;
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    updateActivity = async (activity : Activity) => {
        this.loading = true;
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                // this.activities = [...this.activities.filter(a => a.id !== activity.id), activity];
                this.activityRegistery.set(activity.id,activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.loading = false;
            })
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    deleteActivity = async (id : string) => {
        this.loading = true;
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                // this.activities = [...this.activities.filter(x => x.id !== id)];
                this.activityRegistery.delete(id);
                this.loading = false;
            })
            
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.loading = false;
            })
        }
        
    }
}




// For education only
// export default class ActivityStore {
//     title = 'Hello from MobX'

//     constructor() {

//         makeAutoObservable(this);

//         // makeObservable(this, {
//         //     title: observable,
//         //     // setTitle: action.bound       //If not using an arrow function must bond this
//         //     setTitle: action
//         // })
//     }

//     // setTitle() {                         //If not using arrow function, must bind in constructor ^
//     //     this.title = this.title + '!';
//     // }

//     setTitle = () => {
//         this.title = this.title + '!';
//     }
// }