import {useEffect, useState} from "react";
import PreviewCard from "../components/PreviewCard.jsx";

function Home() {

    const [models, setModels] = useState([]);


    useEffect(() => {
        const fetchModels = async () => {
            const response = await fetch('http://localhost:3939/models');
            const data = await response.json();
            console.log(data);
            setModels(data);
        }

        fetchModels();

    }, []);

    return (
        <section className="flex flex-col items-center gap-6 size-full bg-gray-900">
            <div className="mt-8 max-w-screen-md w-full bg-slate-700 rounded-md">
                <input className="px-5 py-3.5 w-full bg-transparent outline-none" type="text" placeholder="Search models"/>
            </div>
            <div className="flex flex-col h-full overflow-y-auto">
                {
                    models?.forEach(model => {
                        return <PreviewCard model={model}/>
                    })
                }
            </div>
        </section>
    );
}

export default Home;