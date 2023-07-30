
document.addEventListener('DOMContentLoaded', function () {

    const divs = document.querySelectorAll('.box');
    divs.forEach(div => {
        div.addEventListener('click', function (event) {
            let department = event.target;
            department = this.getElementsByClassName('number')[0].innerHTML;

            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {


                    const users = JSON.parse(this.responseText);
                    let table = ' <div class="title">List of employees</div><table>';
                    table += '	<div class="table-header"><div class="header__item">Name</div><div class="header__item">Surname</div><div class="header__item">Username</div><div class="header__item">Department</div><div class="header__item"></div></div>';
                    table += '<tbody>';

                    let data = 0;
                    users.forEach(user => {

                        table += `<div class="table-content">	
            <div class="table-row">		
              <div class="table-data">${user.name}</div>
              <div class="table-data">${user.surname}</div>
              <div class="table-data">${user.username}</div>
              <div class="table-data">${user.department}</div>
              <div class="table-data">
                <button class="dltBtn"  data-item-id="${user.id}" onclick="deleteUser(${user.id})">Delete employee</button>
              
              </div>
            
            </div></div>`;
                    });
                    table += '</tbody></table>';
                    const lista = document.getElementById('lista')
                    lista.style.display = 'block';
                    document.getElementById('tableDiv').innerHTML = table;

                }
            };
            xhr.open('GET', '/department?department=' + department, true);
            xhr.send();
        });
    })
});
const modal = document.getElementById('myModal');
const btnYes = document.querySelector('.yes');
const btnNo = document.querySelector('.no');

const boxes = document.querySelectorAll('.box');
boxes.forEach((div) => {

    div.addEventListener('click', () => {
        boxes.forEach((d) => {
            d.classList.remove('clicked');
        });
        div.classList.add('clicked');
    });
});
let currentUserToDelete = null;

function deleteUser(id) {
    fetch(`/users/${id}`, {
        method: 'GET'
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch user data');
            }
        })
        .then(user => {
            showModal();
            function showModal() {
                modal.style.display = 'block';
            }

            btnYes.addEventListener('click', () => {
                if (currentUserToDelete === id) {
                    fetch(`/users/${id}`, {
                        method: 'DELETE'
                    })
                        .then(response => {
                            if (response.ok) {
                                console.log('User deleted successfully');
                                location.reload();
                            } else {
                                throw new Error('Failed to delete user');
                            }
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }
                closeModal();
            });

            btnNo.addEventListener('click', () => {
                currentUserToDelete = null;
                closeModal();
            });

            function closeModal() {
                modal.style.display = 'none';
            }

            currentUserToDelete = id;
        })
        .catch(error => {
            console.error(error);
        });
}