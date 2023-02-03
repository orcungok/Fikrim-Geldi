
feather.replace({ 'aria-hidden': 'true' })


const projects = document.getElementsByClassName('project-wrapper');
const buttons = document.getElementsByClassName('delete-button');

console.log(projects)
console.log(buttons)

for (let i = 0; i < projects.length; i++) {

  if (buttons[i].id == projects[i].id) {


    buttons[i].addEventListener('click', function deleteProject() {

      projects[i].style.display = 'none';


    })




  }



}

