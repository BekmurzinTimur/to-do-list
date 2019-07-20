import "./styles/reset.scss";
import "./styles/main.scss";
import * as lsModule from "./scripts/localStorageHandler";
import {parse,format, startOfToday} from 'date-fns'
import Sortable from 'sortablejs';
var _ = require('lodash');
const arrayMove = require('array-move');
let listItem = (title,description,dueDate,priority) => {
    let isAccomplished = false;
    return {
        title,
        description,
        dueDate,
        priority,
        isAccomplished
    }
}

let projectsArray = [[],[],[],[]];
let undoProjectsArray = [[],[],[],[]];
//let projectsArray[3] = projectsArray[3];
const displayHandler = (() => 
{
    let currentProject = 0; // Selected project

    let projectsListInner = document.querySelector(".project_list_inner");
    let taskListInner = document.querySelector(".to_do_list_inner");

    const startPage = () => {
        //Get/Set localStorage 
        if (lsModule.chekStorage() === true) {
            if (localStorage.getItem("mainArray")) {
                projectsArray = lsModule.getLocalItem("mainArray");
                saveLastProjectArray();
            } else
            lsModule.populateLocalStorage(projectsArray,"mainArray");
            saveLastProjectArray();
        }

        let clearButton = document.getElementById("clear_button");
        clearButton.addEventListener("click", () => {
            if (prompt("Type 'clear' if you want to erase local storage. That will delete all your projects") == 'clear')
            {
                window.localStorage.clear();
            }
            
        })
        for (let i = 0; i < projectsArray[0].length; i++)
        {
            if (!projectsArray[3][i]) projectsArray[3][i] = [];
            console.log(projectsArray[3][i].length);
        }
        fillList(projectsListInner, "projects");
        openProject(0);
    };

    const fillList = (innerDiv, area) => {
        lsModule.populateLocalStorage(projectsArray,"mainArray");
        //Chek if project was just completed
        if (area == "tasks" && projectsArray[0][currentProject] == undefined)
        {
            innerDiv.textContent = "Project completed! Nothing to do here anymore";
        }
        else {
            // Creating UL to fill it with either projects or tasks
            let ulList = document.createElement("ul");
            ulList.className = "items";
            var sortable = Sortable.create(ulList, { handle: ".my-handle", preventOnFilter: true, onEnd: function (/**Event*/evt) {
                if (area == "tasks")
                {
                    if (projectsArray[0][currentProject][evt.oldIndex] && projectsArray[0][currentProject][evt.newIndex])
                    {
                        projectsArray[0][currentProject] = arrayMove(projectsArray[0][currentProject],evt.oldIndex,evt.newIndex);
                    }
                    openProject(currentProject); 
                } else if (area == "projects")
                {   
                    if (projectsArray[0][evt.oldIndex] && projectsArray[0][evt.newIndex])
                    {
                        projectsArray[0] = arrayMove(projectsArray[0], evt.oldIndex, evt.newIndex);
                        projectsArray[1] = arrayMove(projectsArray[1], evt.oldIndex, evt.newIndex);
                        projectsArray[3] = arrayMove(projectsArray[3], evt.oldIndex, evt.newIndex);
                    }
                    fillList(projectsListInner, "projects"); 
                    if (projectsArray[0][evt.newIndex] == null) {openProject(evt.oldIndex)} else {openProject(evt.newIndex)}
                }          
	        }});

            // Creating UL for completed tasks
            let ulListComplete = document.createElement("ul");
            ulListComplete.classList.add("items");
            ulListComplete.classList.add("complete_list");
            var sortableComplete = Sortable.create(ulListComplete, {
                onEnd: function (/**Event*/evt) {
                    if (projectsArray[3][currentProject][evt.oldIndex] && projectsArray[3][currentProject][evt.newIndex])
                    {
                        projectsArray[3][currentProject] = arrayMove(projectsArray[3][currentProject],evt.oldIndex,evt.newIndex);
                    }
                    openProject(currentProject);
                }
            });

            if (area == "projects")
            {
                while (projectsListInner.firstChild) {
                    projectsListInner.removeChild(projectsListInner.firstChild);
                }
                for (let i = 0; i < projectsArray[1].length; i++)
                {
                    displayProject(i,ulList);
                }
                
            } else
            {
                for (let i = 0; i < projectsArray[0][currentProject].length; i++)
                {
                    if (projectsArray[0][currentProject][i].isAccomplished == false)
                    {
                        displayTask(i,currentProject,ulList, projectsArray[0][currentProject]);
                    }
                }
                for (let i = 0; i < projectsArray[3][currentProject].length; i++)
                {
                    console.log(projectsArray[3][currentProject].length);
                    displayTask(i,currentProject,ulListComplete, projectsArray[3][currentProject]);
                }
            }
            createLastRow(area, ulList);

            innerDiv.appendChild(ulList);
            innerDiv.appendChild(ulListComplete);
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

        selectedClassProject(projectIndex);
    }
    //Create DOM element of single project
    const displayProject = (projectIndex,ulList) => {
        let curItem = document.createElement("li");
        //Scrolling through the names of the projects
        let titleProject = document.createElement("h3");
        titleProject.classList.add("my-handle");
        titleProject.textContent = projectsArray[1][projectIndex];

        curItem.dataset.indexNumber = projectIndex;
        curItem.addEventListener("click", () => {
            openProject(curItem.dataset.indexNumber);
        })
        projectsArray[2][projectIndex] = curItem;
        undoProjectsArray[2][projectIndex] = curItem;
        
        curItem.appendChild(titleProject);
        let editButton = document.createElement("button");
        editButton.innerHTML = '<i class="material-icons">edit</i>';
        editButton.addEventListener("click", () => {
            editItem(curItem, "projects");
        })
        let buttonNav = document.createElement("nav");
        buttonNav.appendChild(editButton);
        curItem.appendChild(buttonNav);
        curItem.classList.add("project_sticker");
        ulList.appendChild(curItem);
        createDeleteButton(curItem,"projects");
    }
    //Create DOM element of single task
    const displayTask = (taskIndex,currentProject,ulList, project) => {
        let curItem = document.createElement("li");
        //Scrolling through the titles of the tasks
        let titleTask = document.createElement("h3");
        titleTask.classList.add("my-handle");
        titleTask.textContent = project[taskIndex].title;
        curItem.dataset.indexNumber = taskIndex;
        curItem.dataset.priority = project[taskIndex].priority;

        let descriptionTask = document.createElement("p");
        descriptionTask.textContent = project[taskIndex].description;

        let dueDateTask = document.createElement("h6");
        dueDateTask.textContent = project[taskIndex].dueDate;

        let buttonNav = document.createElement("nav");
        let completeButton = document.createElement("button");
        completeButton.innerHTML = '<i class="material-icons">done</i>';
        //Complete task on click
        completeButton.addEventListener("click", () => {
            if (project == projectsArray[3][currentProject])
            completeTask(curItem.dataset.indexNumber, currentProject, projectsArray[3][currentProject], projectsArray[0][currentProject]);
            else
            completeTask(curItem.dataset.indexNumber, currentProject, projectsArray[0][currentProject], projectsArray[3][currentProject]);
            curItem.parentNode.removeChild(curItem);
        })
        curItem.appendChild(titleTask); curItem.appendChild(descriptionTask); curItem.appendChild(dueDateTask);

        let editButton = document.createElement("button");
        editButton.innerHTML = '<i class="material-icons">edit</i>';
        editButton.addEventListener("click", () => {
            editItem(curItem, "tasks");
        })
        buttonNav.appendChild(completeButton);

        if (project[taskIndex].isAccomplished == true) {
            completeButton.innerHTML = '<i class="material-icons">undo</i>';
        } else buttonNav.appendChild(editButton);

         
        
        curItem.appendChild(buttonNav);
        curItem.classList.add("sticker");
        createDeleteButton(curItem,"tasks", project[taskIndex].isAccomplished);
        ulList.appendChild(curItem);
    }

    //Delete completed task from array.
    const completeTask = (taskIndex, projectIndex, giveProject, getProject) => {
        saveLastProjectArray();
        //Move task from one project to another
        giveProject[taskIndex].isAccomplished = !giveProject[taskIndex].isAccomplished;
        getProject.push(JSON.parse(JSON.stringify(giveProject.splice(taskIndex,1)[0])));

        lsModule.populateLocalStorage(projectsArray,"mainArray");
        openProject(projectIndex);
    }

    const removeProject = (projectIndex) => {
        saveLastProjectArray();
        projectsArray[0].splice(projectIndex,1);
        projectsArray[1].splice(projectIndex,1);

        fillList(projectsListInner,"projects");
        currentProject = 0;
        openProject(currentProject);
    }

    const removeTask = (projectIndex, taskIndex, isComplete) => {
        saveLastProjectArray();
        if (!isComplete) projectsArray[0][projectIndex].splice(taskIndex,1);
        else projectsArray[3][projectIndex].splice(taskIndex,1);
        fillList(taskListInner, "tasks");
        openProject(currentProject);
    }

    const addTask = (projectIndex,title,description,dueDate,priority) => {
        saveLastProjectArray();
        let newTask = listItem(title,description, dueDate ,priority);
        newTask.isAccomplished = false;
        // If user didnt enter the dueDate - make it today
        if (dueDate == "") newTask.dueDate = format(startOfToday(), 'MM/DD/YYYY');
        projectsArray[0][projectIndex].push(newTask);
    }
    const addProject = (projectTitle) => {
        saveLastProjectArray();
        projectsArray[1].push(projectTitle);
        projectsArray[0].push([]);
        projectsArray[3].push([]);
    }
    //making input and submit button
    const createLastRow = (area, ulList) => {

        //Last row - input for new project
        let inputListItem = document.createElement("li");
        inputListItem.className = "new_button";
        let formItem = document.createElement("form");
        formItem.action = "#";
        let inputList = document.createElement("input");
        //Add button to last row
        let inputListButton = document.createElement("input");


        if (area == "projects")
        {   
            formItem.appendChild(inputList);
            inputList.setAttribute("placeholder", "Add New Project");
            inputList.setAttribute("id", "new_project");
            inputList.setAttribute("maxlength","30");
            inputListButton.id = "projects_new_button";
            inputListButton.addEventListener("click", () => {
                if (inputList.value == "") {
                    alert(`Fill ${area} name field`);
                    return
                }
                addProject(inputList.value); 
                fillList(projectsListInner, "projects"); 
                openProject(projectsArray[0].length - 1);
                selectedClassProject(projectsArray[0].length - 1);
            });

        } else
        {
            inputList.setAttribute("placeholder", "Add New Task");
            inputList.setAttribute("id", "new_task");
            inputList.setAttribute("maxlength","30");

            let inputDescription = document.createElement("input");
            let inputDate = document.createElement("input");
            let inputPriority = makeDropDown(["Low priority", "Normal priority", "High priority"]);

            formItem.appendChild(inputList); 
            formItem.appendChild(inputDescription); 
            formItem.appendChild(inputDate);
            formItem.appendChild(inputPriority);

            inputDescription.type = "text";
            inputDescription.placeholder = "Description";
            inputDescription.maxLength = "80";

            inputDate.type = "date";
            
            inputListButton.id = "to_do_new_button";
            inputListButton.addEventListener("click", () => {
                if (inputList.value == "") {
                    alert(`Fill ${area} name field`);
                    openProject(currentProject);
                    return
                }
                addTask(currentProject, inputList.value, inputDescription.value, inputDate.value, inputPriority.value);
                openProject(currentProject);
            })
        }

        //Adding input to last row
        inputList.setAttribute("type", "text");
        inputListButton.textContent = "Submit";
        inputListButton.setAttribute("type", "submit");
        inputListButton.className = "submit_button";
        
        formItem.appendChild(inputListButton);

        inputListItem.appendChild(formItem);
        inputListItem.classList.add("input_sticker");
        ulList.appendChild(inputListItem);
    }
    const createDeleteButton = (listElement, area, isComplete) => {
        let deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<i class="material-icons">delete_forever</i>';
        deleteButton.className = "delete_button";
        if (area == "tasks")
        {
            deleteButton.addEventListener("click", () => {
                listElement.parentNode.removeChild(listElement);
                removeTask(currentProject, listElement.dataset.indexNumber, isComplete);
            })
        } else
        {
            deleteButton.addEventListener("click", () => {
                listElement.parentNode.removeChild(listElement);
                removeProject(listElement.dataset.indexNumber);
            })
        }
        listElement.lastChild.appendChild(deleteButton);
    }
    const selectedClassProject = (projectIndex) => {
        if (document.querySelector(".selected_project"))
        {
            document.querySelector(".selected_project").classList.remove("selected_project");
        }
        if (projectsArray[0][projectIndex])
        document.querySelector(`[data-index-number="${projectIndex}"`).classList.add("selected_project");
    }
    const editItem = (item, area) => {
        item.classList.add("ignore-elements");
        let oldTitle = item.childNodes[0].textContent;
        while (item.firstChild) {
            item.removeChild(item.firstChild);
        }
        let formEditItem = document.createElement("form");
        let inputAreaEditItem = document.createElement("input"); 
        
        let submitEditItem = document.createElement("input");
        inputAreaEditItem.value = oldTitle;
        inputAreaEditItem.placeholder = "Name";
        inputAreaEditItem.type = "text";
        inputAreaEditItem.maxLength = "30";

        submitEditItem.value = "Submit";
        submitEditItem.type = "submit";
        submitEditItem.className = "submit_button";
        if (area == "projects")
        {
            submitEditItem.addEventListener("click", () => {
                if (inputAreaEditItem.value != "")
                {
                    saveLastProjectArray();
                    projectsArray[1][item.dataset.indexNumber] = inputAreaEditItem.value;
                    item.classList.remove("ignore-elements");
                } 
                fillList(projectsListInner, "projects");
            })
            formEditItem.appendChild(inputAreaEditItem);
        } else
        {
            let oldDescription = projectsArray[0][currentProject][item.dataset.indexNumber].description;
            let oldDate = format(projectsArray[0][currentProject][item.dataset.indexNumber].dueDate, 'YYYY-MM-DD');

            let inputDescriptionEditItem = document.createElement("input");
            let inputDueDateEditItem = document.createElement("input");

            inputDescriptionEditItem.value = oldDescription;
            inputDescriptionEditItem.placeholder = "Description"
            inputDescriptionEditItem.type = "text";
            inputDescriptionEditItem.maxLength = "70";

            inputDueDateEditItem.value = oldDate;
            inputDueDateEditItem.type = "date";

            submitEditItem.addEventListener("click", () => {
                if (inputAreaEditItem.value != "")
                {
                    saveLastProjectArray();
                    projectsArray[0][currentProject][item.dataset.indexNumber].title = inputAreaEditItem.value;
                    projectsArray[0][currentProject][item.dataset.indexNumber].description = inputDescriptionEditItem.value;
                    projectsArray[0][currentProject][item.dataset.indexNumber].priority = inputEditPriority.value;
                    if (inputDueDateEditItem.value != "");
                    projectsArray[0][currentProject][item.dataset.indexNumber].dueDate = format(inputDueDateEditItem.value, 'MM/DD/YYYY');
                }
                item.classList.remove("ignore-elements");
                openProject(currentProject);
            })
            formEditItem.appendChild(inputAreaEditItem);
            formEditItem.appendChild(inputDescriptionEditItem);
            formEditItem.appendChild(inputDueDateEditItem);
            let inputEditPriority = makeDropDown(["Low priority", "Normal priority", "High priority"]);
            inputEditPriority.selectedIndex = 1;
            formEditItem.appendChild(inputEditPriority);
        }
        
        
        formEditItem.appendChild(submitEditItem);
        item.appendChild(formEditItem);
        inputAreaEditItem.focus();
    }
    const makeDropDown = (choices = []) =>
    {
        let newDropDown = document.createElement("select");
        for (let i = 0; i < choices.length; i++)
        {
            let newOption = document.createElement("option");
            newOption.value = choices[i];
            newOption.textContent = choices[i];
            if (i == 1) newOption.selected = "selected";
            newDropDown.appendChild(newOption);
        }
        return newDropDown;
    }

    //Making ctrl+z combination
    function KeyPress(e) {
        var evtobj = window.event? event : e

        if (evtobj.keyCode == 90 && evtobj.ctrlKey) undoChanges();
    }
    document.onkeyup = KeyPress;

    const undoChanges = () => {
        projectsArray = JSON.parse(JSON.stringify(undoProjectsArray));
        lsModule.populateLocalStorage(projectsArray,"mainArray");
        fillList(projectsListInner, "projects");
        if (projectsArray[0][currentProject])
        openProject(currentProject);
        else
        openProject(0);
    }
    const saveLastProjectArray = () => {
        undoProjectsArray = JSON.parse(JSON.stringify(projectsArray));
    }
    return {
        startPage
    }
})();

document.addEventListener("DOMContentLoaded", function() {
displayHandler.startPage();
});