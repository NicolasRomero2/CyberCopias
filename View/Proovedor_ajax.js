document.addEventListener("DOMContentLoaded", () => {
    const addSupplierForm = document.getElementById('addSupplierForm');
    const addOrderForm = document.getElementById('addOrderForm');
    const supplierTableBody = document.getElementById('supplierTable').getElementsByTagName('tbody')[0];
    const supplierOrderSelect = document.getElementById('supplierOrder');
    const orderTableBody = document.getElementById('orderTable').getElementsByTagName('tbody')[0];

    // Función para realizar una petición AJAX
    const ajax = (options) => {
        const { url, method, success, error, data } = options;
        const xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", e => {
            if (xhr.readyState !== 4) return;
            if (xhr.status >= 200 && xhr.status < 300) {
                let json = JSON.parse(xhr.responseText);
                success(json);
            } else {
                let message = xhr.statusText || "Ocurrió un error";
                error(`Error ${xhr.status}: ${message}`);
            }
        });

        xhr.open(method || "GET", url);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(JSON.stringify(data));
    }

    // Función para actualizar la tabla de proveedores
    const updateSupplierTable = () => {
        ajax({
            method: "GET",
            url: "http://localhost:5000/Proveedores",
            success: (res) => {
                supplierTableBody.innerHTML = ''; // Limpiar la tabla antes de actualizar
                res.forEach(supplier => {
                    const row = supplierTableBody.insertRow();
                    row.insertCell(0).textContent = supplier.Nombre;
                    row.insertCell(1).textContent = supplier.Telefono;
                    row.insertCell(2).textContent = supplier.Correo;
                    row.insertCell(3).textContent = supplier.Direccion;
                });
            },
            error: (err) => {
                console.error(err);
                alert("Error al cargar proveedores.");
            }
        });
    }

    // Función para agregar un nuevo proveedor
    const addSupplier = (e) => {
        e.preventDefault();  // Prevenir el comportamiento predeterminado del formulario

        const formData = new FormData(addSupplierForm);
        const supplier = {
            Nombre: formData.get("supplierName"),
            Telefono: formData.get("phone"),
            Correo: formData.get("email"),
            Direccion: formData.get("address")
        };

        ajax({
            method: "POST",
            url: "http://localhost:5000/Proveedores",
            success: (res) => {
                console.log("Proveedor agregado:", res);
                alert("Proveedor agregado con éxito");
                updateSupplierTable(); // Recargar la lista completa de proveedores
                document.getElementById('addSupplierModal').style.display = 'none';
                addSupplierForm.reset();
            },
            error: (err) => {
                console.error(err);
                alert("Error al agregar el proveedor.");
            },
            data: supplier
        });
    }

    // Función para agregar un nuevo pedido
    const addOrder = (e) => {
        e.preventDefault();  // Prevenir el comportamiento predeterminado del formulario

        const formData = new FormData(addOrderForm);
        const order = {
            ProveedorId: parseInt(formData.get("supplierOrder"), 10), // Asegúrate de que el ID sea un número
            Fecha: formData.get("orderDate"),
            Estado: formData.get("orderStatus")
        };

        ajax({
            method: "POST",
            url: "http://localhost:5000/Pedidos",
            success: (res) => {
                console.log("Pedido agregado:", res);
                alert("Pedido agregado con éxito");
                updateOrderTable([res]); // Cambié a un arreglo para actualizar la tabla
                document.getElementById('addOrderModal').style.display = 'none';
                addOrderForm.reset();
            },
            error: (err) => {
                console.error(err);
                alert("Error al agregar el pedido.");
            },
            data: order
        });
    }

    // Actualizar la tabla de pedidos con el nuevo pedido
    const updateOrderTable = (orders) => {
        orderTableBody.innerHTML = ''; // Limpiar la tabla antes de actualizar
        orders.forEach(order => {
            const row = orderTableBody.insertRow();
            const supplierName = getSupplierNameById(order.ProveedorId); // Obtener el nombre del proveedor por ID
            row.insertCell(0).textContent = supplierName || 'Proveedor Desconocido';
            row.insertCell(1).textContent = new Date(order.Fecha).toLocaleString();
            row.insertCell(2).textContent = order.Estado;
        });
    }

    // Función para obtener el nombre del proveedor por ID
    const getSupplierNameById = (supplierId) => {
        const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
        const supplier = suppliers.find(s => s.Id === supplierId);
        return supplier ? supplier.Nombre : 'Proveedor Desconocido';
    }

    // Función para abrir un modal
    const showModal = (modalId) => {
        document.getElementById(modalId).style.display = 'block';
    }

    // Función para cerrar un modal
    const closeModal = (modalId) => {
        document.getElementById(modalId).style.display = 'none';
    }

    // Mostrar y cerrar modales
    document.getElementById('showAddSupplierModal').addEventListener('click', () => showModal('addSupplierModal'));
    document.getElementById('showAddOrderModal').addEventListener('click', () => showModal('addOrderModal'));
    document.getElementById('closeAddSupplierModal').addEventListener('click', () => closeModal('addSupplierModal'));
    document.getElementById('closeAddOrderModal').addEventListener('click', () => closeModal('addOrderModal'));

    // Agregar eventos a los formularios
    addSupplierForm.addEventListener("submit", addSupplier);
    addOrderForm.addEventListener("submit", addOrder);

    // Cargar los proveedores y actualizar la tabla
    updateSupplierTable(); // Cargar la lista de proveedores al inicio

    // Función para llenar el select de proveedores en el modal de pedidos
    const populateSupplierSelect = (suppliers) => {
        supplierOrderSelect.innerHTML = ''; // Limpiar opciones existentes
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.Id; // Asegúrate de que el ID sea un número
            option.textContent = supplier.Nombre;
            supplierOrderSelect.appendChild(option);
        });
    }
});
