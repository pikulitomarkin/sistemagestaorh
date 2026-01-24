namespace HRManagementAPI.Services
{
    public class INSSService
    {
        // Tabela INSS 2024/2025 - Faixas progressivas
        private readonly List<INSSBracket> _brackets = new List<INSSBracket>
        {
            new INSSBracket { MinValue = 0, MaxValue = 1412.00m, Rate = 0.075m },      // 7,5%
            new INSSBracket { MinValue = 1412.01m, MaxValue = 2666.68m, Rate = 0.09m }, // 9%
            new INSSBracket { MinValue = 2666.69m, MaxValue = 4000.03m, Rate = 0.12m }, // 12%
            new INSSBracket { MinValue = 4000.04m, MaxValue = 7786.02m, Rate = 0.14m }  // 14% (teto)
        };

        private const decimal INSSMaxContribution = 7786.02m * 0.14m; // Teto máximo de contribuição

        /// <summary>
        /// Calcula o desconto de INSS de forma progressiva
        /// </summary>
        /// <param name="grossSalary">Salário bruto</param>
        /// <returns>Valor do desconto de INSS</returns>
        public decimal CalculateINSS(decimal grossSalary)
        {
            if (grossSalary <= 0) return 0;

            decimal totalInss = 0;

            // Faixa 1: 7.5%
            if (grossSalary > 0)
            {
                decimal taxableAmount = Math.Min(grossSalary, 1412.00m);
                totalInss += taxableAmount * 0.075m;
            }

            // Faixa 2: 9%
            if (grossSalary > 1412.00m)
            {
                decimal taxableAmount = Math.Min(grossSalary, 2666.68m) - 1412.00m;
                totalInss += taxableAmount * 0.09m;
            }

            // Faixa 3: 12%
            if (grossSalary > 2666.68m)
            {
                decimal taxableAmount = Math.Min(grossSalary, 4000.03m) - 2666.68m;
                totalInss += taxableAmount * 0.12m;
            }

            // Faixa 4: 14%
            if (grossSalary > 4000.03m)
            {
                decimal taxableAmount = Math.Min(grossSalary, 7786.02m) - 4000.03m;
                totalInss += taxableAmount * 0.14m;
            }
            
            // O teto de contribuição em 2024 é R$ 908,85.
            // O cálculo progressivo já resulta nisso naturalmente se o salário for >= 7786.02,
            // mas a verificação explícita é uma boa prática.
            decimal maxDeduction = 908.85m;
            
            return Math.Round(Math.Min(totalInss, maxDeduction), 2);
        }

        private class INSSBracket
        {
            public decimal MinValue { get; set; }
            public decimal MaxValue { get; set; }
            public decimal Rate { get; set; }
        }
    }
}
