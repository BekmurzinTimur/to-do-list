import "./styles/reset.scss";
import "./styles/main.scss";

const listItem = (title,description,dueDate,priority) => {
    let isAcomplished = false; 
    return {
        title,
        description,
        dueDate,
        priority,
        isAcomplished,
        toggle: () => {
            this.isAcomplished = !this.isAcomplished;
        },
    }
}
let projectAlpha = [];
projectAlpha[0] = listItem("titleAlpha1", "descriptionAlpha", "dueDateApha", "priorityAlpha");
projectAlpha[1] = listItem("titleAlpha2", "descriptionAlpha", "dueDateApha", "priorityAlpha");
projectAlpha[2] = listItem("titleAlpha3", "descriptionAlpha", "dueDateApha", "priorityAlpha");
projectAlpha[3] = listItem("titleAlpha4", "descriptionAlpha", "dueDateApha", "priorityAlpha");
projectAlpha[4] = listItem("titleAlpha5", "descriptionAlpha", "dueDateApha", "priorityAlpha");

let projectBeta = [];
projectBeta[0] = listItem("titleBeta", "descriptionBeta", "dueDateBeta", "priorityBeta");
projectBeta[1] = listItem("titleBeta1", "descriptionBeta2", "dueDateBeta3", "priorityBeta4");

let projectsArray = [[projectAlpha, projectBeta],["ProjectAlpha", "ProjectBeta"]];

const displayHandler = (() => 
{
    let currentProject = 0; // Selected project

    let projectsListInner = document.querySelector(".project_list_inner");
    let taskListInner = document.querySelector(".to_do_list_inner");

    const startPage = () => {
        fillList(projectsListInner, "projects");
        fillList(taskListInner, "tasks");
    };

    const fillList = (innerDiv, area) => {

        //Chek if project was just completed
        if (area == "tasks" && projectsArray[0][currentProject] == undefined)
        {
            innerDiv.textContent = "Projects completed! Nothing to do here anymore";
        }
        else {
            // Creating UL to fill it with either projects or tasks
            let ulList = document.createElement("ul");
            ulList.className = "items";

            if (area == "projects")
            {
                while (projectsListInner.firstChild) {
                    projectsListInner.removeChild(projectsListInner.firstChild);
                }
                for (let i = 0; i < projectsArray[1].length; i++)
                {
                    let curItem = document.createElement("li");
                    //Scrolling through the names of the projects
                    curItem.textContent = projectsArray[1][i];
                    curItem.dataset.indexNumber = i;
                    curItem.addEventListener("click", () => {
                        openProject(curItem.dataset.indexNumber);
                    })

                    ulList.appendChild(curItem);
                }
            } else
            {
                for (let i = 0; i < projectsArray[0][currentProject].length; i++)
                {
                    displayTask(i,currentProject,ulList);
                }
            }

            createLastRow(area, ulList);

            innerDiv.appendChild(ulList);
        }
    }

    //replace all tasks with tasks of the new selected project
    const openProject = (projectIndex) => { 
        //removing all childs
        while (taskListInner.firstChild) {
            taskListInner.removeChild(taskListInner.firstChild);
        }
        currentProject = projectIndex;
        fillList(taskListInner, "tasks");
    }

    //Create DOM element of single task
    const displayTask = (taskIndex,currentProject,ulList) => {
        let curItem = document.createElement("li");
        //Scrolling through the titles of the tasks
        curItem.textContent = projectsArray[0][currentProject][taskIndex].title;
        curItem.dataset.indexNumber = taskIndex;
        //Complete task on click
        curItem.addEventListener("click", () => {
                curItem.parentNode.removeChild(curItem);
                completeTask(curItem.dataset.indexNumber, currentProject);
        })
        createDeleteButton(curItem,"tasks");
        ulList.appendChild(curItem);
    }
    //Delete completed task from array.
    const completeTask = (taskIndex, currentProject) => {
        projectsArray[0][currentProject].splice(taskIndex,1);
        chekForCompletedProject(currentProject);
        openProject(currentProject);
    }
    const chekForCompletedProject = (currentProject) => {
        if (projectsArray[0][currentProject][0] == null)
        {
            //remove projects if all tasks in it were completed
            
        }
    }

    const removeProject = () => {
        let curItem = document.querySelector('[data-index-number="'+currentProject+'"');
        curItem.parentNode.removeChild(curItem);
        projectsArray[0].splice(currentProject,1);
    }

    const addTask = (projectIndex,title,description,dueDate,priority) => {
        let newTask = listItem(title,description,dueDate,priority);
        projectsArray[0][projectIndex].push(newTask);
    }
    const addProject = (projectTitle) => {
        projectsArray[1].push(projectTitle);
        projectsArray[0].push([]);
    }
    //making input and submit button
    const createLastRow = (area, ulList) => {

        //Last row - input for new project
        let inputListItem = document.createElement("li");
        inputListItem.className = "new_button";
        let inputList = document.createElement("input");
        //Add button to last row
        let inputListButton = document.createElement("button");


        if (area == "projects")
        {
            inputList.setAttribute("placeholder", "Add New Project");
            inputList.setAttribute("id", "new_project");
            inputListButton.id = "projects_new_button";
            inputListButton.addEventListener("click", () => {
                addProject(inputList.value);
                fillList(projectsListInner, "projects");
                openProject(currentProject);
            })

        } else
        {
            inputList.setAttribute("placeholder", "Add New Task");
            inputList.setAttribute("id", "new_task");
            inputListButton.id = "to_do_new_button";
            inputListButton.addEventListener("click", () => {
                addTask(currentProject, inputList.value,"description","dueDate","priority");
                openProject(currentProject);
            })
        }

        //Adding input to last row
        inputList.setAttribute("type", "text");
        inputListButton.textContent = "Submit";
        
        
        inputListItem.appendChild(inputList);
        inputListItem.appendChild(inputListButton);
        ulList.appendChild(inputListItem);
    }
    const createDeleteButton = (listElement, area) => {
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.className = "delete_button";
        if (area == "tasks")
        {
            deleteButton.addEventListener("click", () => {
                listElement.style.pointerEvents = "none";
                listElement.parentNode.removeChild(listElement);
                completeTask(listElement.dataset.indexNumber, currentProject);
            })
        }
        listElement.appendChild(deleteButton);
    }
    return {
        startPage
    }
})();
document.addEventListener("DOMContentLoaded", function() {
displayHandler.startPage();
});