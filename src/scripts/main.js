const qs = (e, p = document) => p.querySelector(e)
const qsa = (e, p = document) => p.querySelectorAll(e)

const windowOrder = [];

qs("#programs span").onclick = () => {
	qs("#programs").classList.toggle("collapse")
}

async function populateProgramList() {
	const res = await fetch("programs/list.json")
	const programs = JSON.parse(await res.text())
	programs.forEach(e => {
		qs("#program-list").innerHTML += `
			<div class="program" data-path="${e.path}" onclick="openWindow('${e.path}')">${e.name}</div>
		`
	});
}

populateProgramList()

async function openWindow(path) {
	const program = await (await fetch(`programs/${path}`)).text()
	const parts = program.split("#Start")
	const metadata = JSON.parse(parts[0])
	const win = qs("#window-template").content.cloneNode(true).firstElementChild

	win.dataset.id = crypto.randomUUID();
	windowOrder.push(win.dataset.id);
	
	qs(".content", win).srcdoc = parts[1]

	qs(".titlebar .title", win).innerText = metadata.name
	win.classList.add("open")
	qs(".content", win).style.width = metadata.width + "px";
	qs(".content", win).style.height = metadata.height + "px";
	win.classList.toggle("resize", metadata.resizable)
	document.body.appendChild(win)
	const windowState = {}
	
	qs(".titlebar", win).onpointerdown = (e) => {
		const rect = win.getBoundingClientRect()
		
		windowState.offsetX = e.clientX - rect.left
		windowState.offsetY = e.clientY - rect.top
		
		function drag(moveEvent) {
			win.style.left = (moveEvent.clientX - windowState.offsetX) + "px"
			win.style.top  = (moveEvent.clientY - windowState.offsetY) + "px"
			qsa("iframe").forEach(i => i.style.pointerEvents = 'none')
		}
		
		function stopDrag() {
			document.documentElement.removeEventListener("pointermove", drag)
			document.documentElement.removeEventListener("pointerup", stopDrag)
			qsa("iframe").forEach(i => i.style.pointerEvents = 'unset')
		}
		
		document.documentElement.addEventListener("pointermove", drag)
		document.documentElement.addEventListener("pointerup", stopDrag, { once: true })
	}

	win.onpointerdown = () => {
		bringToFront(win.dataset.id);
	}

	qs(".titlebar .close", win).onclick = () => {
		win.animate([{'opacity': '100%', 'opacity': '0%'}], {duration: 300, fill: 'forwards', easing: 'ease'})
		setTimeout(() => {
			windowOrder.splice(windowOrder.indexOf(win.dataset.id), 1);
			win.remove();
		}, 300)
	}

	bringToFront(win.dataset.id);

	qs(".content", win).onload = () => {
		qs(".content", win).contentDocument.addEventListener("pointerdown", () => {
			bringToFront(win.dataset.id);
		});
	};
}

function bringToFront(id) {
	const [item] = windowOrder.splice(windowOrder.indexOf(id), 1);
 	windowOrder.push(item);
	windowOrder.forEach((id, idx) => {
		qs(`.window[data-id="${id}"]`).style.zIndex = 2000 + idx;
	})
}