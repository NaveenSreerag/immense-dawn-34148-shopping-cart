// Change Order Status

let statuses = document.querySelectorAll('.order_status')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time =document.createElement('p')

function updateStatus(order){
    let stepCompleted= true;

    statuses.forEach(function(status){

        let dataProp = status.dataset.status

        if(stepCompleted){
            status.classList.add('active')
        }

        if(dataProp === order.status){
            stepCompleted =false;

            time.innerText = moment(order.updatedAt).format('LLL')
            status.appendChild(time)
        }
    })

}


updateStatus(order);