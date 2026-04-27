const qs = (e, p = document) => p.querySelector(e)

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
	qs(".content", win).srcdoc = parts[1]
	win.classList.add("open")
	win.style.width = metadata.width
	win.style.height = metadata.height
	win.classList.toggle("resize", metadata.resizable)
	document.body.appendChild(win)
}