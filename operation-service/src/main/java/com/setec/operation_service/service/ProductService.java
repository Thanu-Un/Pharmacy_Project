package com.setec.operation_service.service;

import com.setec.operation_service.model.Product;
import com.setec.operation_service.repository.ProductRepository;
import com.setec.operation_service.model.Stock;
import com.setec.operation_service.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            populateStockInfo(product);
        }
        return products;
    }

    public Optional<Product> getProductById(Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        productOpt.ifPresent(this::populateStockInfo);
        return productOpt;
    }

    private void populateStockInfo(Product product) {
        List<Stock> stocks = stockRepository.findByProductId(product.getId());
        product.setStocks(stocks);
        BigDecimal total = stocks.stream()
                .map(Stock::getQuantity)
                .filter(q -> q != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        product.setQuantity(total);
    }

    public Product createProduct(Product product) {
        if (productRepository.existsByCode(product.getCode())) {
            throw new RuntimeException("Product code already exists!");
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getCode().equals(productDetails.getCode()) && productRepository.existsByCode(productDetails.getCode())) {
            throw new RuntimeException("Product code already exists!");
        }

        product.setCode(productDetails.getCode());
        product.setName(productDetails.getName());
        product.setCategory(productDetails.getCategory());

        product.setUnit(productDetails.getUnit());
        product.setSaleUnit(productDetails.getSaleUnit());
        product.setPurchaseUnit(productDetails.getPurchaseUnit());

        product.setBaseUnit1(productDetails.getBaseUnit1());
        product.setPriceBaseUnit1(productDetails.getPriceBaseUnit1());
        product.setBaseUnit2(productDetails.getBaseUnit2());
        product.setPriceBaseUnit2(productDetails.getPriceBaseUnit2());
        product.setBaseUnit3(productDetails.getBaseUnit3());
        product.setPriceBaseUnit3(productDetails.getPriceBaseUnit3());
        product.setBaseUnit4(productDetails.getBaseUnit4());
        product.setPriceBaseUnit4(productDetails.getPriceBaseUnit4());
        product.setBaseUnit5(productDetails.getBaseUnit5());
        product.setPriceBaseUnit5(productDetails.getPriceBaseUnit5());

        product.setCost(productDetails.getCost());
        product.setPrice(productDetails.getPrice());
        product.setAlertQuantity(productDetails.getAlertQuantity());
        product.setTrackQuantity(productDetails.getTrackQuantity());

        product.setImage(productDetails.getImage());
        product.setDetails(productDetails.getDetails());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        try {
            productRepository.deleteById(id);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Cannot delete this product because it has already been used in sales or purchases.");
        }
    }
}
