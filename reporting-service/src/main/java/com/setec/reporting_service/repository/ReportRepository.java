package com.setec.reporting_service.repository;

import com.setec.reporting_service.dto.ReportDTOs.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public class ReportRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReportRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public SalesSummary getSalesSummary(String startDate, String endDate) {
        String sql = "SELECT " +
                "COALESCE(SUM(s.grand_total), 0) as totalRevenue, " +
                "COUNT(s.id) as invoiceCount " +
                "FROM sales s " +
                "WHERE DATE(s.date) >= DATE(?) AND DATE(s.date) <= DATE(?)";

        // To get totalCost we need to join with sale_items and products
        String costSql = "SELECT COALESCE(SUM(si.quantity * p.cost), 0) as totalCost " +
                "FROM sale_items si " +
                "JOIN sales s ON si.sale_id = s.id " +
                "JOIN products p ON si.product_id = p.id " +
                "WHERE DATE(s.date) >= DATE(?) AND DATE(s.date) <= DATE(?)";

        SalesSummary summary = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            SalesSummary s = new SalesSummary();
            s.setTotalRevenue(rs.getBigDecimal("totalRevenue"));
            s.setInvoiceCount(rs.getLong("invoiceCount"));
            return s;
        }, startDate, endDate);

        BigDecimal totalCost = jdbcTemplate.queryForObject(costSql, BigDecimal.class, startDate, endDate);

        if (summary != null) {
            summary.setTotalCost(totalCost != null ? totalCost : BigDecimal.ZERO);
            summary.setNetProfit(summary.getTotalRevenue().subtract(summary.getTotalCost()));
        }

        return summary;
    }

    public InventoryStatus getInventoryStatus() {
        String sql = "SELECT " +
                "COALESCE(SUM(quantity * cost), 0) as totalStockValue, " +
                "COALESCE(SUM(quantity), 0) as totalItems, " +
                "COUNT(CASE WHEN quantity <= alert_quantity THEN 1 END) as lowStockItems " +
                "FROM products";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            InventoryStatus status = new InventoryStatus();
            status.setTotalStockValue(rs.getBigDecimal("totalStockValue"));
            status.setTotalItems(rs.getLong("totalItems"));
            status.setLowStockItems(rs.getLong("lowStockItems"));
            return status;
        });
    }

    public List<TopSellingMedicine> getTopSellingMedicines(String startDate, String endDate, int limit) {
        String sql = "SELECT p.name as medicineName, " +
                "SUM(si.quantity) as quantitySold, " +
                "SUM(si.subtotal) as totalRevenue " +
                "FROM sale_items si " +
                "JOIN sales s ON si.sale_id = s.id " +
                "JOIN products p ON si.product_id = p.id " +
                "WHERE DATE(s.date) >= DATE(?) AND DATE(s.date) <= DATE(?) " +
                "GROUP BY p.id, p.name " +
                "ORDER BY quantitySold DESC " +
                "LIMIT ?";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            TopSellingMedicine med = new TopSellingMedicine();
            med.setMedicineName(rs.getString("medicineName"));
            med.setQuantitySold(rs.getLong("quantitySold"));
            med.setTotalRevenue(rs.getBigDecimal("totalRevenue"));
            return med;
        }, startDate, endDate, limit);
    }

    public List<DailySales> getDailySales(String startDate, String endDate) {
        String sql = "SELECT DATE(s.date) as saleDate, " +
                "COALESCE(SUM(s.grand_total), 0) as revenue, " +
                "COUNT(s.id) as invoices " +
                "FROM sales s " +
                "WHERE DATE(s.date) >= DATE(?) AND DATE(s.date) <= DATE(?) " +
                "GROUP BY DATE(s.date) " +
                "ORDER BY DATE(s.date) ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            DailySales ds = new DailySales();
            ds.setDate(rs.getString("saleDate"));
            ds.setRevenue(rs.getBigDecimal("revenue"));
            ds.setInvoices(rs.getLong("invoices"));
            return ds;
        }, startDate, endDate);
    }

    public List<ProductReport> getProductReport(String startDate, String endDate) {
        String sql = "SELECT " +
                "p.code as productCode, " +
                "p.name as productName, " +
                "COALESCE(purch.purchasedQty, 0) as purchasedQty, " +
                "COALESCE(purch.purchasedAmt, 0) as purchasedAmt, " +
                "COALESCE(sale.soldQty, 0) as soldQty, " +
                "COALESCE(sale.soldAmt, 0) as soldAmt, " +
                "p.quantity as stockQty, " +
                "(p.quantity * p.cost) as stockAmt, " +
                "(COALESCE(sale.soldAmt, 0) - COALESCE(purch.purchasedAmt, 0)) as profitLoss " +
                "FROM products p " +
                "LEFT JOIN ( " +
                "    SELECT pi.product_id, SUM(pi.quantity) as purchasedQty, SUM(pi.subtotal) as purchasedAmt " +
                "    FROM purchase_items pi " +
                "    JOIN purchases pur ON pi.purchase_id = pur.id " +
                "    WHERE (CAST(? AS VARCHAR) IS NULL OR CAST(? AS VARCHAR) = '' OR (DATE(pur.date) >= CAST(? AS DATE) AND DATE(pur.date) <= CAST(? AS DATE))) " +
                "    GROUP BY pi.product_id " +
                ") purch ON p.id = purch.product_id " +
                "LEFT JOIN ( " +
                "    SELECT si.product_id, SUM(si.quantity) as soldQty, SUM(si.subtotal) as soldAmt " +
                "    FROM sale_items si " +
                "    JOIN sales s ON si.sale_id = s.id " +
                "    WHERE (CAST(? AS VARCHAR) IS NULL OR CAST(? AS VARCHAR) = '' OR (DATE(s.date) >= CAST(? AS DATE) AND DATE(s.date) <= CAST(? AS DATE))) " +
                "    GROUP BY si.product_id " +
                ") sale ON p.id = sale.product_id " +
                "ORDER BY p.id ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            ProductReport pr = new ProductReport();
            pr.setProductCode(rs.getString("productCode"));
            pr.setProductName(rs.getString("productName"));
            pr.setPurchasedQty(rs.getLong("purchasedQty"));
            pr.setPurchasedAmt(rs.getBigDecimal("purchasedAmt"));
            pr.setSoldQty(rs.getLong("soldQty"));
            pr.setSoldAmt(rs.getBigDecimal("soldAmt"));
            pr.setStockQty(rs.getLong("stockQty"));
            pr.setStockAmt(rs.getBigDecimal("stockAmt"));
            pr.setProfitLoss(rs.getBigDecimal("profitLoss"));
            return pr;
        }, startDate, startDate, startDate, endDate, startDate, startDate, startDate, endDate);
    }

    public List<CategoryReport> getCategoriesReport(String startDate, String endDate) {
        String sql = "SELECT " +
                "c.code as categoryCode, " +
                "c.name as categoryName, " +
                "COALESCE(purch.purchasedQty, 0) as purchasedQty, " +
                "COALESCE(purch.purchasedAmt, 0) as purchasedAmt, " +
                "COALESCE(sale.soldQty, 0) as soldQty, " +
                "COALESCE(sale.soldAmt, 0) as soldAmt, " +
                "(COALESCE(sale.soldAmt, 0) - COALESCE(purch.purchasedAmt, 0)) as profitLoss " +
                "FROM categories c " +
                "LEFT JOIN ( " +
                "    SELECT p.category_id, SUM(pi.quantity) as purchasedQty, SUM(pi.subtotal) as purchasedAmt " +
                "    FROM purchase_items pi " +
                "    JOIN purchases pur ON pi.purchase_id = pur.id " +
                "    JOIN products p ON pi.product_id = p.id " +
                "    WHERE (CAST(? AS VARCHAR) IS NULL OR CAST(? AS VARCHAR) = '' OR (DATE(pur.date) >= CAST(? AS DATE) AND DATE(pur.date) <= CAST(? AS DATE))) " +
                "    GROUP BY p.category_id " +
                ") purch ON c.id = purch.category_id " +
                "LEFT JOIN ( " +
                "    SELECT p.category_id, SUM(si.quantity) as soldQty, SUM(si.subtotal) as soldAmt " +
                "    FROM sale_items si " +
                "    JOIN sales s ON si.sale_id = s.id " +
                "    JOIN products p ON si.product_id = p.id " +
                "    WHERE (CAST(? AS VARCHAR) IS NULL OR CAST(? AS VARCHAR) = '' OR (DATE(s.date) >= CAST(? AS DATE) AND DATE(s.date) <= CAST(? AS DATE))) " +
                "    GROUP BY p.category_id " +
                ") sale ON c.id = sale.category_id " +
                "ORDER BY c.name ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            CategoryReport cr = new CategoryReport();
            cr.setCategoryCode(rs.getString("categoryCode"));
            cr.setCategoryName(rs.getString("categoryName"));
            cr.setPurchasedQty(rs.getLong("purchasedQty"));
            cr.setPurchasedAmt(rs.getBigDecimal("purchasedAmt"));
            cr.setSoldQty(rs.getLong("soldQty"));
            cr.setSoldAmt(rs.getBigDecimal("soldAmt"));
            cr.setProfitLoss(rs.getBigDecimal("profitLoss"));
            return cr;
        }, startDate, startDate, startDate, endDate, startDate, startDate, startDate, endDate);
    }

    public List<PurchaseItemReport> getPurchaseItemReport(String startDate, String endDate) {
        String sql = "SELECT " +
                "TO_CHAR(pur.date, 'MM/dd/yyyy') as date, " +
                "pur.reference_no as referenceNo, " +
                "s.name as supplier, " +
                "p.code as productCode, " +
                "p.name as product, " +
                "pi.quantity as quantity, " +
                "pi.unit_cost as price, " +
                "pi.subtotal as total " +
                "FROM purchase_items pi " +
                "JOIN purchases pur ON pi.purchase_id = pur.id " +
                "JOIN products p ON pi.product_id = p.id " +
                "LEFT JOIN suppliers s ON pur.supplier_id = s.id " +
                "WHERE (CAST(? AS VARCHAR) IS NULL OR CAST(? AS VARCHAR) = '' OR (DATE(pur.date) >= CAST(? AS DATE) AND DATE(pur.date) <= CAST(? AS DATE))) " +
                "ORDER BY pur.date DESC, p.name ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            PurchaseItemReport pir = new PurchaseItemReport();
            pir.setDate(rs.getString("date"));
            pir.setReferenceNo(rs.getString("referenceNo"));
            pir.setSupplier(rs.getString("supplier"));
            pir.setProductCode(rs.getString("productCode"));
            pir.setProduct(rs.getString("product"));
            pir.setQuantity(rs.getLong("quantity"));
            pir.setPrice(rs.getBigDecimal("price"));
            pir.setTotal(rs.getBigDecimal("total"));
            return pir;
        }, startDate, startDate, startDate, endDate);
    }

    public List<ProfitLossReport> getProfitLossReport(String startDate, String endDate) {
        String sql = "SELECT " +
                "TO_CHAR(s.date, 'MM/dd/yyyy') as date, " +
                "SUM(s.grand_total) as revenue, " +
                "COALESCE(SUM(c.cost), 0) as cost, " +
                "SUM(s.grand_total) - COALESCE(SUM(c.cost), 0) as profit " +
                "FROM sales s " +
                "LEFT JOIN ( " +
                "    SELECT si.sale_id, SUM(si.quantity * p.cost) as cost " +
                "    FROM sale_items si " +
                "    JOIN products p ON si.product_id = p.id " +
                "    GROUP BY si.sale_id " +
                ") c ON s.id = c.sale_id " +
                "WHERE (CAST(? AS VARCHAR) IS NULL OR CAST(? AS VARCHAR) = '' OR (DATE(s.date) >= CAST(? AS DATE) AND DATE(s.date) <= CAST(? AS DATE))) " +
                "GROUP BY TO_CHAR(s.date, 'MM/dd/yyyy'), DATE(s.date) " +
                "ORDER BY DATE(s.date) DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            ProfitLossReport plr = new ProfitLossReport();
            plr.setDate(rs.getString("date"));
            plr.setRevenue(rs.getBigDecimal("revenue"));
            plr.setCost(rs.getBigDecimal("cost"));
            plr.setProfit(rs.getBigDecimal("profit"));
            return plr;
        }, startDate, startDate, startDate, endDate);
    }

    public List<MonthlyProfitLossReport> getMonthlyProfitLossReport(int year) {
        String sql = "WITH months AS ( " +
                "    SELECT generate_series(1, 12) AS month_num " +
                "), " +
                "monthly_sales AS ( " +
                "    SELECT EXTRACT(MONTH FROM s.date) as month_num, " +
                "           SUM(s.grand_total) as total_sale, " +
                "           SUM(s.discount) as total_discount, " +
                "           SUM(s.total) as total_net_income " +
                "    FROM sales s " +
                "    WHERE EXTRACT(YEAR FROM s.date) = ? " +
                "    GROUP BY EXTRACT(MONTH FROM s.date) " +
                "), " +
                "monthly_cogs AS ( " +
                "    SELECT EXTRACT(MONTH FROM s.date) as month_num, " +
                "           SUM(si.quantity * p.cost) as cogs " +
                "    FROM sale_items si " +
                "    JOIN sales s ON si.sale_id = s.id " +
                "    JOIN products p ON si.product_id = p.id " +
                "    WHERE EXTRACT(YEAR FROM s.date) = ? " +
                "    GROUP BY EXTRACT(MONTH FROM s.date) " +
                "), " +
                "monthly_expenses AS ( " +
                "    SELECT EXTRACT(MONTH FROM e.date) as month_num, " +
                "           ec.name as category_name, " +
                "           SUM(e.amount) as total_amount " +
                "    FROM expenses e " +
                "    JOIN expense_categories ec ON e.category_id = ec.id " +
                "    WHERE EXTRACT(YEAR FROM e.date) = ? " +
                "    GROUP BY EXTRACT(MONTH FROM e.date), ec.name " +
                ") " +
                "SELECT m.month_num, " +
                "       COALESCE(s.total_sale, 0) as total_sale, " +
                "       COALESCE(s.total_discount, 0) as total_discount, " +
                "       COALESCE(s.total_net_income, 0) as total_net_income, " +
                "       COALESCE(c.cogs, 0) as cogs, " +
                "       (COALESCE(s.total_net_income, 0) - COALESCE(c.cogs, 0)) as gross_profit " +
                "FROM months m " +
                "LEFT JOIN monthly_sales s ON m.month_num = s.month_num " +
                "LEFT JOIN monthly_cogs c ON m.month_num = c.month_num " +
                "ORDER BY m.month_num ASC";

        List<MonthlyProfitLossReport> reports = jdbcTemplate.query(sql, (rs, rowNum) -> {
            MonthlyProfitLossReport r = new MonthlyProfitLossReport();
            int m = rs.getInt("month_num");
            String[] monthNames = {"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"};
            r.setMonth(monthNames[m - 1]);
            r.setTotalSale(rs.getBigDecimal("total_sale"));
            r.setTotalDiscount(rs.getBigDecimal("total_discount"));
            r.setTotalNetIncome(rs.getBigDecimal("total_net_income"));
            r.setCostOfGoodsSold(rs.getBigDecimal("cogs"));
            r.setGrossProfit(rs.getBigDecimal("gross_profit"));
            return r;
        }, year, year, year);

        // Fetch all expenses for the year and map them
        String expSql = "SELECT EXTRACT(MONTH FROM e.date) as month_num, ec.name as category, SUM(e.amount) as amount " +
                "FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id " +
                "WHERE EXTRACT(YEAR FROM e.date) = ? " +
                "GROUP BY EXTRACT(MONTH FROM e.date), ec.name";

        jdbcTemplate.query(expSql, rs -> {
            int m = rs.getInt("month_num");
            String category = rs.getString("category");
            BigDecimal amount = rs.getBigDecimal("amount");

            MonthlyProfitLossReport r = reports.get(m - 1);
            if (category.equalsIgnoreCase("Electricity")) r.setElectricity(amount);
            else if (category.equalsIgnoreCase("Rental")) r.setRental(amount);
            else if (category.equalsIgnoreCase("Security")) r.setSecurity(amount);
            else if (category.equalsIgnoreCase("Staff Salary")) r.setStaffSalary(amount);
            else if (category.equalsIgnoreCase("Water expense")) r.setWaterExpense(amount);
            else if (category.equalsIgnoreCase("Gas")) r.setGas(amount);
            else if (category.equalsIgnoreCase("Internet Expense")) r.setInternetExpense(amount);
            else if (category.equalsIgnoreCase("Office Supply Expense")) r.setOfficeSupplyExpense(amount);
            else if (category.equalsIgnoreCase("Repair & Maintenance")) r.setRepairMaintenance(amount);
            else if (category.equalsIgnoreCase("Fixed Assets")) r.setFixedAssets(amount);
            else if (category.equalsIgnoreCase("Other Costing")) r.setOtherCosting(amount);
            else {
                r.setOtherExpenses(r.getOtherExpenses().add(amount));
            }
        }, year);

        // Calculate totals
        for (MonthlyProfitLossReport r : reports) {
            BigDecimal totalExp = BigDecimal.ZERO;
            totalExp = totalExp.add(r.getElectricity()).add(r.getRental()).add(r.getSecurity())
                    .add(r.getStaffSalary()).add(r.getWaterExpense()).add(r.getGas())
                    .add(r.getInternetExpense()).add(r.getOfficeSupplyExpense()).add(r.getRepairMaintenance())
                    .add(r.getFixedAssets()).add(r.getOtherExpenses()).add(r.getOtherCosting());
            r.setTotalExpenses(totalExp);
            r.setNetProfit(r.getGrossProfit().subtract(totalExp));
        }

        return reports;
    }
}
