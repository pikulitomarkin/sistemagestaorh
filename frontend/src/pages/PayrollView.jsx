import { useEffect, useState } from 'react';
import api from '../services/api';

const PayrollView = () => {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    const fetchPayrolls = async () => {
      const res = await api.get('/payroll/my-payrolls');
      setPayrolls(res.data);
    };
    fetchPayrolls();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl">Meu Holerite</h2>
      <ul>
        {payrolls.map(p => (
          <li key={p.id} className="border p-2 mt-2">
            Período: {p.periodStart} - {p.periodEnd}, Salário Líquido: R$ {p.netSalary}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PayrollView;