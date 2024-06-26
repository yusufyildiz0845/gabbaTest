"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import LoadingScreen from "@/components/other/loading";
import ListProducts from "./listProducts";
import BasketOffer from "./basketOffer";
import OrderOffer from "./orderOffer";
import { getAPI } from "@/services/fetchAPI";
import FinancialManagementCalculate from "@/functions/others/financialManagementCalculate";
import { BiFilterAlt } from "react-icons/bi";
import { FaFileInvoice } from "react-icons/fa";
import { BsCart3 } from "react-icons/bs";
import { IoChevronForwardOutline } from "react-icons/io5";
import { IoChevronBackOutline } from "react-icons/io5";

const CreateOfferComponent = () => {
  const [showOrderOffer, setShowOrderOffer] = useState(false);
  const [hiddenBasketBar, setHiddenBasketBar] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productFeatures, setProductFeatures] = useState([]);
  const [showBasketOffer, setShowBasketOffer] = useState(false);
  const [isCustomerAndPersonel, setIsCustomerAndPersonel] = useState(false);
  const [allFeatureValues, setAllFeatureValues] = useState([]);
  // Müşteriler bilgisi
  const [customers, setCustomers] = useState([]);

  // Yazdırma ekranına gönderilecek prop
  const [selectedOrder, setSelectedOrder] = useState([]);

  // Sepetteki ürünleri tuttuğumuz state.
  const [basketData, setBasketData] = useState([]);
  // Sepetteki ürünlerin stok değerlerini tuttuğumuz state.
  const getData = async (condition) => {
    try {
      setIsloading(true);
      if (condition === "onlyBasket") {
        const response = getAPI("/createOffer/basket");
        const [dataResult] = await Promise.all([response]);
        setIsloading(false);
        return setBasketData(dataResult.data);
      }

      if (condition === "onlyCustomer") {
        const response = await getAPI("/customer");
        setCustomers(response.data);
        return setIsloading(false);
      }

      const response1 = getAPI("/createProduct/createProduct");
      const response2 = getAPI("/createOffer/basket");
      const response3 = getAPI("/customer");
      const [createProductResult, basketResult, customerResult] =
        await Promise.all([response1, response2, response3]);

      if (!createProductResult) {
        throw new Error("Veri çekilemedi 2");
      }

      if (createProductResult.status !== "success") {
        throw new Error("Veri çekilemedi");
      }

      // response.data.createProducts içerisindeki değerleri gez ve "productName" değerlerine göre küçükten büyüğe doğru sırala.
      await createProductResult.data.createProducts.sort((a, b) =>
        a.productName.localeCompare(b.productName)
      );
      await Promise.all(
        await createProductResult.data.createProducts.map(async (item) => {
          const { result } = await FinancialManagementCalculate(
            item.productPrice
          );
          item.productPrice = result[result.length - 1];
        })
      );
      setProducts(createProductResult.data.createProducts);
      setProductFeatures(createProductResult.data.productFeatures);
      setBasketData(basketResult.data);
      setCustomers(customerResult.data);
      setIsloading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      {isloading && <LoadingScreen isloading={isloading} />}

      <div
        className={`${
          hiddenBasketBar ? "hidden" : "flex"
        } flex-col md:flex-row p-2 lg:p-2 lg:px-10 w-full justify-between mb-4 items-center shadow-lg  bg-gray-100 gap-2 pr-4`}
      >
        {/* Filtreleme ve Teklifler Butonu */}
        {!showBasketOffer && (
          <div className="flex justify-center item-center flex-col md:flex-row gap-2 px-4 my-2">
            <button className="bg-green-500 p-4 text-white rounded lg:text-lg flex flex-row gap-2 flex-nowrap hover:cursor-pointer hover:scale-105 transition-all mt-2 lg:mt-0">
              <BiFilterAlt size={25} />
              Filtrele
            </button>
            {!showOrderOffer && (
              <button
                onClick={() => {
                  setShowOrderOffer(true);
                  setShowBasketOffer(false);
                }}
                className="bg-purple-600 p-4 text-white rounded lg:text-lg flex flex-row gap-2 flex-nowrap hover:cursor-pointer hover:scale-105 transition-all mt-2 lg:mt-0"
              >
                <FaFileInvoice size={25} />
                Teklifler
              </button>
            )}
          </div>
        )}

        {/* Sepet Butonu */}
        {!showBasketOffer && !showOrderOffer && (
          <div className="justify-end mr-4 flex center items-center gap-4">
            <button onClick={() => setShowBasketOffer(true)}>
              <div className="relative py-2 hover:scale-110 transition-all">
                <div className="t-0 absolute left-3">
                  <p className="flex h-2 w-2 items-center justify-center rounded-full bg-red-500 p-3 text-md text-white">
                    {basketData.length}
                  </p>
                </div>
                <BsCart3 size={25} className="file: mt-4 h-6 w-6" />
              </div>
            </button>
          </div>
        )}

        {isCustomerAndPersonel && (
          <button
            onClick={() => setIsCustomerAndPersonel(false)}
            type="button"
            className="hover:scale-105 transition-all flex justify-center items-center p-2 text-white font-semibold bg-gray-800 rounded group
"
          >
            <IoChevronBackOutline
              size={22}
              className="text-white transform translate-x-0 group-hover:-translate-x-2 transition-transform"
            />
            Geri
          </button>
        )}
        {/* Eğer sepet butonuna basılırsa */}
        {showBasketOffer && (
          <>
            {!isCustomerAndPersonel && (
              <button
                onClick={() => {
                  setShowBasketOffer(false);
                  setShowOrderOffer(false);
                }}
                type="button"
                className="bg-green-600 rounded text-white p-4 flex flex-row gap-2 flex-nowrap justify-center items-center hover:cursor-pointer hover:scale-105 transition-all"
              >
                Teklif Oluştur
              </button>
            )}
            <p className="font-semibold text-lg">
              Toplam Ürün: {basketData.length}
            </p>
            <div className="flex justify-center item-center flex-row lg:flex-row gap-2 px-4 my-2">
              {!isCustomerAndPersonel && basketData.length > 0 && (
                <button
                  onClick={() => setIsCustomerAndPersonel(true)}
                  type="button"
                  className="hover:scale-105 transition-all flex justify-center items-center p-2 text-white font-semibold bg-gray-800 rounded group
                  "
                >
                  İleri
                  <IoChevronForwardOutline
                    size={22}
                    className="text-white transform translate-x-0 group-hover:translate-x-2 transition-transform"
                  />
                </button>
              )}
            </div>
          </>
        )}
        {showOrderOffer && (
          <>
            {selectedOrder.data && (
              <button
                onClick={() => {
                  setShowOrderOffer(true);
                  setSelectedOrder([]);
                  setShowBasketOffer(false);
                }}
                className="bg-purple-600 p-4 text-white rounded lg:text-lg flex flex-row gap-2 flex-nowrap hover:cursor-pointer hover:scale-105 transition-all mt-2 lg:mt-0"
              >
                <FaFileInvoice size={25} />
                Teklifler
              </button>
            )}
            {!selectedOrder.data && (
              <button
                onClick={() => {
                  setShowOrderOffer(false);
                  setShowBasketOffer(false);
                  setSelectedOrder([]);
                }}
                type="button"
                className="bg-green-600 rounded text-white p-4 flex flex-row gap-2 flex-nowrap justify-center items-center hover:cursor-pointer hover:scale-105 transition-all"
              >
                Teklif Oluştur
              </button>
            )}
          </>
        )}
      </div>
      {showOrderOffer && (
        <OrderOffer
          toast={toast}
          showOrderOffer={showOrderOffer}
          setShowOrderOffer={setShowOrderOffer}
          setIsloading={setIsloading}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
        />
      )}

      {showBasketOffer && (
        <BasketOffer
          toast={toast}
          getData={getData}
          basketData={basketData}
          setBasketData={setBasketData}
          isloading={isloading}
          setIsloading={setIsloading}
          productFeatures={productFeatures}
          setShowOrderOffer={setShowOrderOffer}
          setShowBasketOffer={setShowBasketOffer}
          setIsCustomerAndPersonel={setIsCustomerAndPersonel}
          isCustomerAndPersonel={isCustomerAndPersonel}
          setHiddenBasketBar={setHiddenBasketBar}
          setAllFeatureValues={setAllFeatureValues}
          allFeatureValues={allFeatureValues}
          customers={customers}
        />
      )}
      {!showBasketOffer && !showOrderOffer && (
        <ListProducts
          getData={getData}
          toast={toast}
          isloading={isloading}
          setIsloading={setIsloading}
          products={products}
          productFeatures={productFeatures}
          setHiddenBasketBar={setHiddenBasketBar}
          setAllFeatureValues={setAllFeatureValues}
          allFeatureValues={allFeatureValues}
        />
      )}
    </>
  );
};

export default CreateOfferComponent;
