package com.setec.operation_service.service;

import com.setec.operation_service.model.Customer;
import com.setec.operation_service.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer createCustomer(Customer customer) {
        if (customerRepository.findByCode(customer.getCode()).isPresent()) {
            throw new RuntimeException("Customer code already exists: " + customer.getCode());
        }
        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) {
            Customer defaultCustomer = new Customer();
            defaultCustomer.setCode("PAT-0001");
            defaultCustomer.setName("Walk-in Patient");
            defaultCustomer.setPhone("N/A");
            defaultCustomer.setAddress("Phnom Penh");
            defaultCustomer.setCity("Phnom Penh");
            customerRepository.save(defaultCustomer);
            return customerRepository.findAll();
        }
        return customers;
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    public Customer updateCustomer(Long id, Customer updatedCustomer) {
        return customerRepository.findById(id).map(existing -> {
            existing.setName(updatedCustomer.getName());
            existing.setEmailAddress(updatedCustomer.getEmailAddress());
            existing.setPhone(updatedCustomer.getPhone());
            existing.setAddress(updatedCustomer.getAddress());
            existing.setCity(updatedCustomer.getCity());
            return customerRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Customer not found with ID: " + id));
    }

    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found with ID: " + id);
        }
        customerRepository.deleteById(id);
    }
}
