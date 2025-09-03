const loginsec=document.querySelector('.login-section')
const loginlink=document.querySelector('.login-link')
const registerlink=document.querySelector('.register-link')
registerlink.addEventListener('click',()=>{
    loginsec.classList.add('active')
})
loginlink.addEventListener('click',()=>{
    loginsec.classList.remove('active')
})



let next = document.querySelector('.next')
let prev = document.querySelector('.prev')

next.addEventListener('click', function(){
  let items =document.querySelectorAll('.item')

  document.querySelector('.slide').appendChild(items[0])
})

prev.addEventListener('click', function(){
  let items = document.querySelectorAll('.item')
  document.querySelector('.slide').prepend(items[items.length - 1])
})



