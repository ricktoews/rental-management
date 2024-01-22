import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTenants } from '../utils/apis';

const TableMaint = () => {
    const { table } = useParams();
    const [data, setData] = useState([]);

    useEffect(() => {
        getTenants().then(res => {
            setData(res);
        })
    }, []);

    return (
        <>
            <h1>Table Maint for {table}</h1>

            <table className="table">
                <tbody>
                    {data.map((row, key) => {
                        return (<tr key={key}>
                            <td>{row.last_name}</td>
                            <td>{row.first_name}</td>
                        </tr>);
                    })}
                </tbody>
            </table>
        </>
    );
}

export default TableMaint;
