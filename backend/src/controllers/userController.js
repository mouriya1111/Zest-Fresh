async function addAddress(request, response, next) {
  try {
    if (request.body.isDefault) {
      request.user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    request.user.addresses.push(request.body);
    await request.user.save();
    response.status(201).json({ addresses: request.user.addresses });
  } catch (error) {
    next(error);
  }
}

async function listAddresses(request, response) {
  response.json({ addresses: request.user.addresses });
}

async function toggleFavorite(request, response, next) {
  try {
    const productId = request.params.productId;
    const exists = request.user.favorites.some((id) => id.toString() === productId);

    if (exists) {
      request.user.favorites = request.user.favorites.filter((id) => id.toString() !== productId);
    } else {
      request.user.favorites.push(productId);
    }

    await request.user.save();
    response.json({ favorites: request.user.favorites });
  } catch (error) {
    next(error);
  }
}

module.exports = { addAddress, listAddresses, toggleFavorite };
