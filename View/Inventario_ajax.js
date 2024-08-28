const d = document;
        const modal = d.getElementById('editModal');
        const closeModal = d.querySelector('.close');
        const saveButton = d.getElementById('saveButton');
        const cancelButton = d.getElementById('cancelButton');
        let currentProductId = null;
        let productos = [];
        
        // Función AJAX con Promesas
        const ajax = (options) => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open(options.method || "GET", options.url);
                xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error(`Error: ${xhr.statusText}`));
                    }
                };
        
                xhr.onerror = () => reject(new Error("Network error"));
        
                xhr.send(JSON.stringify(options.data) || null);
            });
        };
        
        // Cargar productos desde la base de datos
        const loadProducts = async () => {
            try {
                productos = await ajax({ method: "GET", url: "http://localhost:5000/Producto" });
                const table = d.getElementById("productTable");
                table.innerHTML = '';
        
                productos.forEach(product => {
                    const row = table.insertRow();
                    row.innerHTML = `
                        <td>${product.Nombre}</td>
                        <td>${product.Descripcion}</td>
                        <td>${product.Marca}</td>
                        <td>${product.Precio}</td>
                        <td>${product.Stock}</td>
                        <td>
                            <button class="edit" data-id="${product.id}">Editar</button>
                            <button class="delete" data-id="${product.id}">Eliminar</button>
                        </td>
                    `;
                });
        
                // Eventos para editar
                d.querySelectorAll('.edit').forEach(button => {
                    button.addEventListener('click', () => {
                        const productId = button.getAttribute('data-id');
                        showEditModal(productId);
                    });
                });
        
                // Eventos para eliminar
                d.querySelectorAll('.delete').forEach(button => {
                    button.addEventListener('click', () => {
                        const productId = button.getAttribute('data-id');
                        deleteProduct(productId);
                    });
                });
            } catch (error) {
                console.error(error);
            }
        };
        
        // Mostrar modal para editar
        const showEditModal = (productId) => {
            currentProductId = productId;
            const producto = productos.find((producto) => String(producto.id) === String(productId));
            if (producto) {
                d.getElementById('editNombre').value = producto.Nombre;
                d.getElementById('editDescripcion').value = producto.Descripcion;
                d.getElementById('editMarca').value = producto.Marca;
                d.getElementById('editPrecio').value = producto.Precio;
                d.getElementById('editStock').value = producto.Stock;
                d.getElementById('editMinimoStock').value = producto.MinimoStock;
                modal.style.display = 'flex'; // Mostrar modal
            } else {
                alert("El producto no existe");
            }
        };
        
        // Actualizar un producto (con método PUT)
        const updateProduct = async (productId, updatedProduct) => {
            try {
                const response = await ajax({
                    method: "PUT",
                    url: `http://localhost:5000/Producto/${productId}`,
                    data: updatedProduct,
                });
        
                if (response.success) {
                    modal.style.display = 'none'; // Ocultar modal
                    loadProducts(); // Recargar productos después de la actualización
                    alert('Producto actualizado exitosamente');
                } else {
                    console.error("Error en la actualización:", response.message);
                }
            } catch (error) {
                console.error(`Error actualizando el producto:`, error);
            }
        };
        
        // Manejar clic en el botón de guardar
        saveButton.addEventListener('click', async () => {
            const updatedProduct = {
                Nombre: d.getElementById('editNombre').value,
                Descripcion: d.getElementById('editDescripcion').value,
                Marca: d.getElementById('editMarca').value,
                Precio: parseFloat(d.getElementById('editPrecio').value),
                Stock: parseInt(d.getElementById('editStock').value),
                MinimoStock: parseInt(d.getElementById('editMinimoStock').value)
            };
        
            try {
                await updateProduct(currentProductId, updatedProduct); // Cambiado a currentProductId
            } catch (error) {
                console.error(error);
            }
        });
        
        // Eliminar producto
        const deleteProduct = async (productId) => {
            if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
                try {
                    await ajax({ method: "DELETE", url: `http://localhost:5000/Producto/${productId}` });
                    loadProducts();
                } catch (error) {
                    console.error(error);
                }
            }
        };
        
        // Cerrar modal
        cancelButton.addEventListener('click', () => {
            modal.style.display = 'none'; // Ocultar modal
            currentProductId = null;
        });
        
        // Cerrar modal al hacer clic fuera del modal
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none'; // Ocultar modal
                currentProductId = null;
            }
        });
        
        // Cargar productos al inicio
        loadProducts();