import "./BottomMenu.css"
import { useState } from "react"

export default function BottomMenu(){

const [open,setOpen] = useState(false)

return(

<div>

{open && (

<div className="menuPopup">

<button>Cadastrar mecânico</button>
<button>Cadastrar oficina</button>
<button>Cadastrar serviço</button>

</div>

)}

<div className="bottomMenu">

<span>🏠</span>
<span>🔍</span>

<span
className="addButton"
onClick={()=>setOpen(!open)}
>
➕
</span>

<span>❤️</span>
<span>👤</span>

</div>

</div>

)

}