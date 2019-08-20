const args = new URLSearchParams(location.search);
let iframe = document.querySelector('iframe');
iframe.addEventListener('load', () => {
    document.body.dataset.mode = 'ready';
});
console.log(args.get('url'))
iframe.src = decodeURIComponent(args.get('url'))