const qs = (e, p = document) => p.querySelector(e);

qs("#programs span").onclick = () => {
	qs("#programs").classList.toggle("collapse")
}